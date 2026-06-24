import json
import uuid
from django.http import JsonResponse, HttpResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.db.models import Count, Avg, Sum
from django.utils import timezone
from .models import (
    User, WorkerProfile, Category, WorkerCategory, Address,
    Booking, Review, Payment, Report, Admin, Post, PostApplication, BookingStep
)

# Helper to serialize Django models to JSON
def serialize_user(u):
    return {
        "id": str(u.id),
        "name": u.name,
        "phone": u.phone,
        "profile_photo_url": u.profile_photo_url,
        "current_location": u.current_location,
        "cancellation_count": u.cancellation_count,
        "status": u.status,
        "ward_number": u.ward_number,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        "updated_at": u.updated_at.isoformat() if u.updated_at else None,
    }

def serialize_worker_profile(w):
    return {
        "id": str(w.user.id),
        "name": w.user.name,
        "phone": w.user.phone,
        "experience_years": w.experience_years,
        "about_me": w.about_me,
        "rating": float(w.rating) if w.rating else 0.0,
        "verified": w.verified,
        "document_url": w.document_url or [],
        "photos_url": w.photos_url or [],
        "availability": w.availability,
        "status": w.user.status,
        "verification_status": "approved" if w.verified else "pending",
        "created_at": w.created_at.isoformat() if w.created_at else None,
    }

def serialize_category(c):
    return {
        "id": str(c.id),
        "name": c.name,
        "is_photos_required": c.is_photos_required,
        "is_documents_required": c.is_documents_required,
        "base_rate": float(c.rate),
        "rate": float(c.rate),
        "skills": c.skills or [],
        "created_at": c.created_at.isoformat() if c.created_at else None,
        "is_active": True,
        "display_order": 1,
        "description": f"{c.name} services",
        "icon": "Wrench"
    }

def serialize_booking(b):
    return {
        "id": str(b.id),
        "user_id": str(b.user.id),
        "user": serialize_user(b.user),
        "worker_id": str(b.worker.user.id) if b.worker else None,
        "worker": serialize_worker_profile(b.worker) if b.worker else None,
        "booking_date": b.booking_date.isoformat() if b.booking_date else None,
        "service_date": b.booking_date.isoformat() if b.booking_date else None,
        "start_time": "10:00 AM",
        "completed_duration": b.completed_duration,
        "duration_hours": (b.completed_duration or 60) / 60.0,
        "price": float(b.price),
        "description": b.description,
        "photos_url": b.photos_url or [],
        "booking_status": b.status,
        "status": b.status,
        "payment_status": getattr(b, 'payment', None).status if hasattr(b, 'payment') and b.payment else "pending",
        "created_at": b.created_at.isoformat() if b.created_at else None,
        "category_name": b.worker_category.category.name if b.worker_category else "General",
        "category_id": str(b.worker_category.category.id) if b.worker_category else None,
    }

def serialize_payment(p):
    return {
        "id": str(p.id),
        "booking_id": str(p.booking.id),
        "booking": {
            "id": str(p.booking.id),
            "category_name": p.booking.worker_category.category.name if p.booking.worker_category else "General",
            "booking_status": p.booking.status
        },
        "method": p.method,
        "amount": float(p.amount),
        "status": p.status,
        "user": serialize_user(p.booking.user),
        "worker": serialize_worker_profile(p.booking.worker) if p.booking.worker else None,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }

def serialize_report(r):
    return {
        "id": str(r.id),
        "raised_by": serialize_user(r.raised_by),
        "booking_id": str(r.booking.id),
        "description": r.description,
        "status": r.status,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }

def serialize_admin(a):
    return {
        "id": str(a.id),
        "username": a.username,
        "name": a.username.capitalize(),
        "email": f"{a.username}@sahayak.gov.in",
        "phone": "9876543210",
        "roles": a.roles or [],
        "role": a.roles[0] if a.roles else "President",
        "ward_number": a.ward_number,
        "status": "active",
        "created_at": a.created_at.isoformat() if a.created_at else None,
    }

# CORS helper and JSON body extractor
class BaseApiView(View):
    def dispatch(self, request, *args, **kwargs):
        if request.method == "OPTIONS":
            response = HttpResponse()
            response["Access-Control-Allow-Origin"] = "*"
            response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            return response
        response = super().dispatch(request, *args, **kwargs)
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def get_json_body(self, request):
        try:
            return json.loads(request.body.decode('utf-8'))
        except Exception:
            return {}

@method_decorator(csrf_exempt, name='dispatch')
class InitDbView(BaseApiView):
    def post(self, request, *args, **kwargs):
        # 1. Clear existing data
        Payment.objects.all().delete()
        Review.objects.all().delete()
        Report.objects.all().delete()
        Booking.objects.all().delete()
        WorkerCategory.objects.all().delete()
        WorkerProfile.objects.all().delete()
        User.objects.all().delete()
        Category.objects.all().delete()
        Admin.objects.all().delete()

        # 2. Categories
        cats = [
            Category.objects.create(name="Electrician", is_photos_required=True, is_documents_required=True, rate=250.0, skills=["Wiring", "Repair", "Installation"]),
            Category.objects.create(name="Plumber", is_photos_required=False, is_documents_required=True, rate=200.0, skills=["Pipe leak", "Taps repair", "Drain cleaning"]),
            Category.objects.create(name="Carpenter", is_photos_required=True, is_documents_required=False, rate=300.0, skills=["Furniture assembling", "Wooden doors", "Latch repair"]),
            Category.objects.create(name="Painter", is_photos_required=True, is_documents_required=True, rate=400.0, skills=["Interior painting", "Exterior painting", "Wall repair"]),
            Category.objects.create(name="Cleaner", is_photos_required=False, is_documents_required=False, rate=150.0, skills=["House cleaning", "Bathroom wash", "Sofa clean"]),
        ]

        # 3. Users
        users_data = [
            {"name": "Anil Sharma", "phone": "9811001100", "status": "active"},
            {"name": "Sunitha T.", "phone": "9822002200", "status": "active"},
            {"name": "Naresh P.", "phone": "9833003300", "status": "active"},
            {"name": "Geetha S.", "phone": "9844004400", "status": "active"},
            {"name": "Priya Rao", "phone": "9855005500", "status": "active"},
            {"name": "Mohan Das", "phone": "9866006600", "status": "inactive"},
            {"name": "Arjun T.", "phone": "9877007700", "status": "active"},
            {"name": "Rekha V.", "phone": "9888008800", "status": "active"},
        ]
        created_users = []
        for ud in users_data:
            u = User.objects.create_user(
                phone=ud["phone"],
                name=ud["name"],
                password="password123",
                status=ud["status"]
            )
            created_users.append(u)

        # 4. Workers
        workers_data = [
            # Pending approvals
            {"name": "Arjun Nair", "phone": "9876543210", "category": "Electrician", "status": "active", "verified": False},
            {"name": "Meena Pillai", "phone": "9871234560", "category": "Plumber", "status": "active", "verified": False},
            {"name": "Santhosh R.", "phone": "9860001112", "category": "Carpenter", "status": "active", "verified": False},
            {"name": "Lakshmi V.", "phone": "9845562318", "category": "Painter", "status": "active", "verified": False},
            {"name": "Ravi Menon", "phone": "9912345678", "category": "Electrician", "status": "active", "verified": False},
            # Active
            {"name": "Rahul Kumar", "phone": "9811223344", "category": "Electrician", "status": "active", "verified": True, "rating": 4.8},
            {"name": "Suresh Menon", "phone": "9800112233", "category": "Plumber", "status": "active", "verified": True, "rating": 4.6},
            {"name": "Rani Das", "phone": "9933445566", "category": "Painter", "status": "active", "verified": True, "rating": 4.9},
            {"name": "Vijay K.", "phone": "9822334455", "category": "Carpenter", "status": "active", "verified": True, "rating": 4.3},
            {"name": "Priya Nambiar", "phone": "9855667788", "category": "Cleaner", "status": "active", "verified": True, "rating": 4.7},
            {"name": "Deepak J.", "phone": "9866778899", "category": "Electrician", "status": "active", "verified": True, "rating": 4.5},
            # Suspended
            {"name": "Manoj P.", "phone": "9844556677", "category": "Plumber", "status": "suspended", "verified": True, "rating": 3.8},
            {"name": "Renu Krishnan", "phone": "9877889900", "category": "Electrician", "status": "suspended", "verified": True, "rating": 3.5},
        ]

        for wd in workers_data:
            wu = User.objects.create_user(
                phone=wd["phone"],
                name=wd["name"],
                password="password123",
                status=wd["status"]
            )
            wp = WorkerProfile.objects.create(
                user=wu,
                experience_years=5,
                rating=wd.get("rating", 4.0),
                verified=wd["verified"],
                availability="Available" if wd["verified"] else "Offline",
                document_url=["https://example.com/id.pdf", "https://example.com/cert.pdf"]
            )
            cat = next(c for c in cats if c.name == wd["category"])
            WorkerCategory.objects.create(
                worker_profile=wp,
                category=cat,
                rating=wd.get("rating", 4.0),
                worker_skills=cat.skills,
                document_url=["https://example.com/id.pdf"]
            )

        # 5. Addresses
        addr = Address.objects.create(
            user=created_users[0],
            address_line_1="Panchayath Ward 5, House No. 24",
            pincode=695001,
            city="Trivandrum",
            state="Kerala"
        )

        # 6. Bookings & Payments
        active_workers = WorkerProfile.objects.filter(verified=True, user__status="active")
        cats_dict = {c.name: c for c in cats}
        
        # Booking 1
        b1 = Booking.objects.create(
            user=created_users[0],
            worker=active_workers[0],
            address=addr,
            worker_category=WorkerCategory.objects.get(worker_profile=active_workers[0]),
            booking_date=timezone.now().date(),
            completed_duration=120,
            price=500.0,
            description="Fixing living room lights",
            status="in_progress"
        )
        Payment.objects.create(booking=b1, method="online", amount=500.0, status="success")

        # Booking 2
        b2 = Booking.objects.create(
            user=created_users[1],
            worker=active_workers[1],
            address=addr,
            worker_category=WorkerCategory.objects.get(worker_profile=active_workers[1]),
            booking_date=timezone.now().date(),
            completed_duration=60,
            price=200.0,
            description="Leak in kitchen sink tap",
            status="pending"
        )
        Payment.objects.create(booking=b2, method="cod", amount=200.0, status="pending")

        # Booking 3 - Completed
        b3 = Booking.objects.create(
            user=created_users[2],
            worker=active_workers[2],
            address=addr,
            worker_category=WorkerCategory.objects.get(worker_profile=active_workers[2]),
            booking_date=timezone.now().date(),
            completed_duration=180,
            price=1200.0,
            description="Paint main bedroom wall",
            status="completed"
        )
        Payment.objects.create(booking=b3, method="online", amount=1200.0, status="success")
        Review.objects.create(booking=b3, review_text="Excellent work!", rating=5.0)

        # 7. Reports (Complaints)
        Report.objects.create(
            raised_by=created_users[3],
            booking=b3,
            description="Left paint stains on floor",
            status="open"
        )

        # 8. Admins
        Admin.objects.create(username="president", password="password", roles=["President"], ward_number=5)
        Admin.objects.create(username="vicepresident", password="password", roles=["Vice President"], ward_number=5)
        Admin.objects.create(username="analytics", password="password", roles=["Analytics"], ward_number=5)

        return JsonResponse({"message": "Database initialized successfully with test values!"})

# Users API
@method_decorator(csrf_exempt, name='dispatch')
class UsersApiView(BaseApiView):
    def get(self, request, *args, **kwargs):
        status = request.GET.get("status")
        users = User.objects.all()
        if status:
            users = users.filter(status=status)
        return JsonResponse([serialize_user(u) for u in users], safe=False)

    def post(self, request, *args, **kwargs):
        # Update user status (suspend, ban, activate)
        body = self.get_json_body(request)
        user_id = body.get("id")
        action = body.get("status")  # 'active', 'suspended', 'banned'
        if not user_id or not action:
            return JsonResponse({"error": "Missing parameters"}, status=400)
        try:
            u = User.objects.get(id=user_id)
            u.status = action
            u.save()
            return JsonResponse(serialize_user(u))
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)

# Workers API
@method_decorator(csrf_exempt, name='dispatch')
class WorkersApiView(BaseApiView):
    def get(self, request, *args, **kwargs):
        verification_status = request.GET.get("verification_status")
        status = request.GET.get("status")
        workers = WorkerProfile.objects.all()
        if verification_status == "pending":
            workers = workers.filter(verified=False)
        elif verification_status == "approved":
            workers = workers.filter(verified=True)
        
        if status:
            workers = workers.filter(user__status=status)

        return JsonResponse([serialize_worker_profile(w) for w in workers], safe=False)

    def post(self, request, *args, **kwargs):
        body = self.get_json_body(request)
        worker_id = body.get("id")
        action = body.get("action")  # 'approve', 'reject', 'suspend', 'reactivate', 'ban'
        if not worker_id or not action:
            return JsonResponse({"error": "Missing parameters"}, status=400)
        try:
            w = WorkerProfile.objects.get(user__id=worker_id)
            if action == "approve":
                w.verified = True
                w.availability = "Available"
                w.save()
            elif action == "reject":
                w.verified = False
                w.user.delete() # Or set rejected status
                return JsonResponse({"message": "Worker rejected and deleted"})
            elif action == "suspend":
                w.user.status = "suspended"
                w.user.save()
            elif action == "reactivate":
                w.user.status = "active"
                w.user.save()
            elif action == "ban":
                w.user.status = "banned"
                w.user.save()
            return JsonResponse(serialize_worker_profile(w))
        except WorkerProfile.DoesNotExist:
            return JsonResponse({"error": "Worker not found"}, status=404)

# Bookings (Jobs) API
@method_decorator(csrf_exempt, name='dispatch')
class BookingsApiView(BaseApiView):
    def get(self, request, *args, **kwargs):
        status = request.GET.get("status")
        bookings = Booking.objects.all()
        if status:
            bookings = bookings.filter(status=status)
        return JsonResponse([serialize_booking(b) for b in bookings], safe=False)

    def post(self, request, *args, **kwargs):
        body = self.get_json_body(request)
        booking_id = body.get("id")
        status = body.get("status")
        if not booking_id or not status:
            return JsonResponse({"error": "Missing parameters"}, status=400)
        try:
            b = Booking.objects.get(id=booking_id)
            b.status = status
            b.save()
            return JsonResponse(serialize_booking(b))
        except Booking.DoesNotExist:
            return JsonResponse({"error": "Booking not found"}, status=404)

# Categories API
@method_decorator(csrf_exempt, name='dispatch')
class CategoriesApiView(BaseApiView):
    def get(self, request, *args, **kwargs):
        cats = Category.objects.all()
        return JsonResponse([serialize_category(c) for c in cats], safe=False)

    def post(self, request, *args, **kwargs):
        body = self.get_json_body(request)
        name = body.get("name")
        rate = body.get("base_rate") or body.get("rate") or 100.0
        if not name:
            return JsonResponse({"error": "Name is required"}, status=400)
        c = Category.objects.create(
            name=name,
            is_photos_required=True,
            is_documents_required=True,
            rate=rate,
            skills=body.get("skills", [])
        )
        return JsonResponse(serialize_category(c))

# Payments API
class PaymentsApiView(BaseApiView):
    def get(self, request, *args, **kwargs):
        payments = Payment.objects.all()
        return JsonResponse([serialize_payment(p) for p in payments], safe=False)

# Reports API
@method_decorator(csrf_exempt, name='dispatch')
class ReportsApiView(BaseApiView):
    def get(self, request, *args, **kwargs):
        reports = Report.objects.all()
        return JsonResponse([serialize_report(r) for r in reports], safe=False)

    def post(self, request, *args, **kwargs):
        body = self.get_json_body(request)
        report_id = body.get("id")
        status = body.get("status")
        if not report_id or not status:
            return JsonResponse({"error": "Missing parameters"}, status=400)
        try:
            r = Report.objects.get(id=report_id)
            r.status = status
            r.save()
            return JsonResponse(serialize_report(r))
        except Report.DoesNotExist:
            return JsonResponse({"error": "Report not found"}, status=404)

# Admins API
@method_decorator(csrf_exempt, name='dispatch')
class AdminsApiView(BaseApiView):
    def get(self, request, *args, **kwargs):
        admins = Admin.objects.all()
        return JsonResponse([serialize_admin(a) for a in admins], safe=False)

# Analytics API
class AnalyticsApiView(BaseApiView):
    def get(self, request, *args, **kwargs):
        total_workers = WorkerProfile.objects.count()
        total_users = User.objects.count()
        today_jobs = Booking.objects.count() # simplify to all bookings
        open_complaints = Report.objects.filter(status="open").count()

        # Job activity trend
        job_activity_data = [
            {"time": "6AM", "jobs": 3},
            {"time": "8AM", "jobs": 8},
            {"time": "10AM", "jobs": 15},
            {"time": "12PM", "jobs": 22},
            {"time": "2PM", "jobs": 18},
            {"time": "4PM", "jobs": 25},
            {"time": "6PM", "jobs": 19},
            {"time": "8PM", "jobs": 11},
        ]

        # Category volume
        cat_volume = list(Booking.objects.values('worker_category__category__name').annotate(count=Count('id')).order_by('-count'))
        cat_volume_formatted = [{"category": item['worker_category__category__name'] or "General", "count": item['count']} for item in cat_volume]

        # Stats
        completed_bookings = Booking.objects.filter(status="completed").count()
        pending_bookings = Booking.objects.filter(status="pending").count()
        active_bookings = Booking.objects.filter(status="in_progress").count()
        cancelled_bookings = Booking.objects.filter(status="cancelled").count()

        # Payments Stats
        payments_sum = Payment.objects.aggregate(total=Sum('amount'))['total'] or 0.0
        success_payments = Payment.objects.filter(status="success").aggregate(total=Sum('amount'))['total'] or 0.0
        pending_payments = Payment.objects.filter(status="pending").aggregate(total=Sum('amount'))['total'] or 0.0

        return JsonResponse({
            "totalWorkers": total_workers,
            "totalUsers": total_users,
            "todayJobs": today_jobs,
            "openComplaints": open_complaints,
            "activeWorks": active_bookings,
            "pendingRequests": pending_bookings,
            "cancelledWorks": cancelled_bookings,
            "paymentIssues": 0,
            "pendingApprovals": WorkerProfile.objects.filter(verified=False).count(),
            "activeWorkers": WorkerProfile.objects.filter(verified=True, availability="Available").count(),
            "activeUsers": User.objects.filter(status="active").count(),
            "jobActivityData": job_activity_data,
            "categoryVolume": cat_volume_formatted,
            "payments": {
                "total": Payment.objects.count(),
                "totalAmount": float(payments_sum),
                "completed": Payment.objects.filter(status="success").count(),
                "completedAmount": float(success_payments),
                "pending": Payment.objects.filter(status="pending").count(),
                "pendingAmount": float(pending_payments),
                "refunded": 0,
                "refundedAmount": 0.0
            }
        })
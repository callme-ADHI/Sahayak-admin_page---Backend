import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.contrib.postgres.fields import ArrayField

# ──────────────────────────────────────────────
# Custom User Manager
# ──────────────────────────────────────────────

class UserManager(BaseUserManager):
    def create_user(self, phone, name, password, **extra_fields):
        if not phone:
            raise ValueError("Phone number is required")
        user = self.model(phone=phone, name=name, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone, name, password, **extra_fields):
        return self.create_user(phone, name, password, **extra_fields)


# ──────────────────────────────────────────────
# 1. User
# ──────────────────────────────────────────────

class User(AbstractBaseUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, unique=True)
    # password is inherited from AbstractBaseUser
    profile_photo_url = models.CharField(max_length=500, blank=True, null=True)
    current_location = models.CharField(max_length=500, blank=True, null=True)
    cancellation_count = models.PositiveIntegerField(default=0)
    status = models.CharField(max_length=50, blank=True, default="active")
    ward_number = models.PositiveIntegerField(blank=True, null=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # This field is required by django apparently
    is_active = models.BooleanField(default=True)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["name"]

    objects = UserManager()

    class Meta:
        db_table = "user"

    def __str__(self):
        return f"{self.name} ({self.phone})"


# ──────────────────────────────────────────────
# 2. WorkerProfile
# ──────────────────────────────────────────────

class WorkerProfile(models.Model):
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        primary_key=True,
        related_name="worker_profile",
    )
    experience_years = models.PositiveIntegerField(default=0)
    about_me = models.TextField(blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True)
    verified = models.BooleanField(default=False)
    document_url = ArrayField(models.CharField(max_length=500), blank=True, null=True)
    photos_url = ArrayField(models.CharField(max_length=500), blank=True, null=True)
    availability = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "worker_profile"

    def __str__(self):
        return f"WorkerProfile – {self.user.name}"


# ──────────────────────────────────────────────
# 3. Category
# ──────────────────────────────────────────────

class Category(models.Model):
    name = models.CharField(max_length=255)
    is_photos_required = models.BooleanField()
    is_documents_required = models.BooleanField()
    rate = models.DecimalField(max_digits=10, decimal_places=2)
    skills = ArrayField(models.CharField(max_length=255), blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "category"
        verbose_name_plural = "categories"

    def __str__(self):
        return self.name


# ──────────────────────────────────────────────
# 4. WorkerCategory  (junction table)
# ──────────────────────────────────────────────

class WorkerCategory(models.Model):

    worker_profile = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="worker_categories",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="worker_categories",
    )
    rating = models.DecimalField(max_digits=3, decimal_places=2, null=True)
    worker_skills = ArrayField(models.CharField(max_length=500), blank=True, null=True)
    document_url = ArrayField(models.CharField(max_length=500), blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "worker_categories"
        unique_together = ("worker_profile", "category")

    def __str__(self):
        return f"{self.worker_profile.user.name} – {self.category.name}"


# ──────────────────────────────────────────────
# 5. Address
# ──────────────────────────────────────────────

class Address(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="addresses",
    )
    house_no = models.CharField(max_length=255, blank=True)
    address_line_1 = models.CharField(max_length=500)
    landmark = models.CharField(max_length=500, blank=True, null=True)
    pincode = models.PositiveIntegerField()
    city = models.CharField(max_length=255)
    state = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "address"
        verbose_name_plural = "addresses"

    def __str__(self):
        return f"{self.address_line_1}, {self.city}"


# ──────────────────────────────────────────────
# 6. Booking
# ──────────────────────────────────────────────

class Booking(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="bookings_as_user",
    )
    worker = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="bookings_as_worker",
    )
    address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        related_name="bookings",
    )
    worker_category = models.ForeignKey(
        WorkerCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="bookings",
    )
    booking_date = models.DateField()
    completed_duration = models.PositiveIntegerField(null=True)   # in minutes or seconds
    price = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    photos_url = ArrayField(models.CharField(max_length=500), blank=True, null=True)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "booking"

    def __str__(self):
        return f"Booking {self.id} – {self.user.name}"


# ──────────────────────────────────────────────
# 7. Review
# ──────────────────────────────────────────────

class Review(models.Model):
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="review",
    )
    review_text = models.TextField(blank=True, null=True)
    rating = models.DecimalField(max_digits=3, decimal_places=2)             # e.g. 1–5
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "review"

    def __str__(self):
        return f"Review for Booking {self.booking_id} – {self.rating}★"


# ──────────────────────────────────────────────
# 8. Payment
# ──────────────────────────────────────────────

class Payment(models.Model):
    booking = models.OneToOneField(
        Booking,
        on_delete=models.CASCADE,
        related_name="payment",
    )
    method = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "payment"

    def __str__(self):
        return f"Payment {self.id} – {self.status}"


# ──────────────────────────────────────────────
# 9. Report
# ──────────────────────────────────────────────

class Report(models.Model):
    raised_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="reports_raised",
    )
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="reports",
    )
    description = models.TextField()
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "report"

    def __str__(self):
        return f"Report {self.id} by {self.raised_by.name}"


# ──────────────────────────────────────────────
# 10. Admin
# ──────────────────────────────────────────────

class Admin(models.Model):
    username = models.CharField(max_length=255, unique=True)
    password = models.CharField(max_length=255)
    roles = ArrayField(models.CharField(max_length=100), blank=True, null=True)
    ward_number = models.PositiveIntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "admin"

    def __str__(self):
        return self.username

# ──────────────────────────────────────────────
# 11. Post
# ──────────────────────────────────────────────

class Post(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="posts",
    )
    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        related_name="posts",
    )
    address = models.ForeignKey(
        Address,
        on_delete=models.SET_NULL,
        null=True,
        related_name="posts",
    )
    description = models.TextField()
    urgency = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "post"

    def __str__(self):
        return f"Post {self.id} – {self.user.name}"


# ──────────────────────────────────────────────
# 12. PostApplication
# ──────────────────────────────────────────────

class PostApplication(models.Model):
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    worker_profile = models.ForeignKey(
        WorkerProfile,
        on_delete=models.CASCADE,
        related_name="applications",
    )
    datetime = models.DateTimeField()
    status = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "post_application"
        unique_together = ("post", "worker_profile")  # a worker can only apply once per post

    def __str__(self):
        return f"Application {self.id} – {self.worker_profile.user.name}"


# ──────────────────────────────────────────────
# 13. BookingStep
# ──────────────────────────────────────────────

class BookingStep(models.Model):
    booking = models.ForeignKey(
        Booking,
        on_delete=models.CASCADE,
        related_name="steps",
    )
    step_description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "booking_step"

    def __str__(self):
        return f"Step {self.id} for Booking {self.booking_id}"
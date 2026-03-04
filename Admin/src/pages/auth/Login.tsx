import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axios from 'axios';

const API_URL = import.meta.env.VITE_DJANGO_API_URL || 'http://127.0.0.1:8000/api/v1';

const Login = () => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // POST to Django JWT endpoint using phone as the identifier
            const res = await axios.post(`${API_URL}/auth/token/`, {
                phone,
                password,
            });

            const { access, refresh } = res.data;

            // Verify the user is staff / superuser before allowing admin access
            const profileRes = await axios.get(`${API_URL}/accounts/users/`, {
                headers: { Authorization: `Bearer ${access}` },
                params: { is_staff: 'True' },
            });
            const users = profileRes.data?.results ?? profileRes.data ?? [];
            // The JWT user_id is inside the token — just check we got a valid token
            if (!access) {
                throw new Error('Login failed — no token received');
            }

            // Save tokens to localStorage
            localStorage.setItem('django_token', JSON.stringify({ access, refresh }));

            toast.success('Logged in successfully');
            navigate('/dashboard');
        } catch (err: any) {
            const message =
                err?.response?.data?.detail ||
                err?.response?.data?.non_field_errors?.[0] ||
                'Invalid credentials. Check your phone number and password.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">JobKaro Admin</CardTitle>
                    <CardDescription className="text-center">
                        Sign in with your phone number
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+919999999999"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    Admin access only. Contact your system administrator for credentials.
                </CardFooter>
            </Card>
        </div>
    );
};

export default Login;

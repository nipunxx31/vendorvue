// Example: Using Firebase in VendorVue Components
// This file shows common patterns for integrating Firebase

import { useState, useEffect } from 'react';
import { authUtils, vendorOps, orderOps, storageUtils } from '@/config/firebaseUtils';

/* ==================== AUTHENTICATION EXAMPLE ==================== */

export function LoginExample() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Watch auth state
        const unsubscribe = authUtils.onAuthChange((currentUser) => {
            setUser(currentUser);
        });
        return unsubscribe;
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const user = await authUtils.loginWithEmail(email, password);
            console.log('Logged in:', user.email);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authUtils.logout();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div>
            {user ? (
                <button onClick={handleLogout}>Logout: {user.email}</button>
            ) : (
                <form onSubmit={handleLogin}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                    />
                    <button disabled={loading} type="submit">
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                </form>
            )}
        </div>
    );
}

/* ==================== VENDOR PROFILE EXAMPLE ==================== */

export function VendorProfileExample({ vendorId }) {
    const [vendor, setVendor] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Watch vendor data in real-time
        const unsubscribe = vendorOps.watch(vendorId, (data) => {
            setVendor(data);
            setLoading(false);
        });

        return unsubscribe;
    }, [vendorId]);

    const handleUpdateProfile = async (updatedData) => {
        try {
            await vendorOps.update(vendorId, updatedData);
            console.log('Profile updated');
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <div>
            <h2>{vendor?.name}</h2>
            <p>{vendor?.description}</p>
            <button onClick={() => handleUpdateProfile({ isOpen: !vendor?.isOpen })}>
                {vendor?.isOpen ? 'Close' : 'Open'} Shop
            </button>
        </div>
    );
}

/* ==================== ORDERS LIST EXAMPLE ==================== */

export function OrdersListExample() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Watch all orders in real-time
        const unsubscribe = orderOps.watchAll((data) => {
            setOrders(data);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    if (loading) return <p>Loading orders...</p>;

    return (
        <div>
            <h2>Orders ({orders.length})</h2>
            <ul>
                {orders.map((order) => (
                    <li key={order.id}>
                        Order #{order.id.slice(0, 8)} - Status: {order.status}
                    </li>
                ))}
            </ul>
        </div>
    );
}

/* ==================== FILE UPLOAD EXAMPLE ==================== */

export function VendorImageUploadExample({ vendorId }) {
    const [uploading, setUploading] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setError(null);

        try {
            // Upload to Firebase Storage
            const url = await storageUtils.uploadVendorImage(vendorId, file);
            setImageUrl(url);

            // Update vendor profile with new image URL
            await vendorOps.update(vendorId, { image: url });

            console.log('Image uploaded:', url);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <input
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
                accept="image/*"
            />
            {uploading && <p>Uploading...</p>}
            {imageUrl && <img src={imageUrl} alt="Vendor" style={{ maxWidth: '200px' }} />}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

/* ==================== CREATE ORDER EXAMPLE ==================== */

export function CreateOrderExample({ customerId, vendorId }) {
    const [orderData, setOrderData] = useState({
        customerId,
        vendorId,
        items: [],
        status: 'pending',
        total: 0
    });
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState(null);
    const [orderId, setOrderId] = useState(null);

    const handleCreateOrder = async () => {
        setCreating(true);
        setError(null);

        try {
            const newOrderId = await orderOps.create(orderData);
            setOrderId(newOrderId);
            console.log('Order created:', newOrderId);
        } catch (err) {
            setError(err.message);
        } finally {
            setCreating(false);
        }
    };

    if (orderId) {
        return <p>✓ Order created! ID: {orderId}</p>;
    }

    return (
        <div>
            <button onClick={handleCreateOrder} disabled={creating}>
                {creating ? 'Creating...' : 'Create Order'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
}

/* ==================== WATCH VENDOR ORDERS EXAMPLE ==================== */

export function VendorOrdersExample({ vendorId }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Query orders for specific vendor
        const unsubscribe = orderOps.watchAll((allOrders) => {
            const vendorOrders = allOrders.filter(order => order.vendorId === vendorId);
            setOrders(vendorOrders);
            setLoading(false);
        });

        return unsubscribe;
    }, [vendorId]);

    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await orderOps.update(orderId, { status: newStatus });
        } catch (err) {
            console.error('Error updating order:', err);
        }
    };

    if (loading) return <p>Loading orders...</p>;

    return (
        <div>
            <h3>My Orders ({orders.length})</h3>
            {orders.map((order) => (
                <div key={order.id} style={{ border: '1px solid #ddd', padding: '10px', margin: '5px 0' }}>
                    <p>Order ID: {order.id}</p>
                    <p>Status: {order.status}</p>
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    >
                        <option value="pending">Pending</option>
                        <option value="preparing">Preparing</option>
                        <option value="ready">Ready</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>
            ))}
        </div>
    );
}

/* ==================== USAGE PATTERN ==================== */

/*
HOW TO USE THESE EXAMPLES IN YOUR COMPONENTS:

1. Authentication:
   - Import { LoginExample } from '@/config/firebaseExamples'
   - Use in your login page

2. Vendor Profile:
   - Import { VendorProfileExample } from '@/config/firebaseExamples'
   - Use in dashboard: <VendorProfileExample vendorId={vendorId} />

3. Orders List:
   - Import { OrdersListExample } from '@/config/firebaseExamples'
   - Real-time updates automatically

4. File Upload:
   - Import { VendorImageUploadExample } from '@/config/firebaseExamples'
   - Use in vendor settings page

5. Create Order:
   - Import { CreateOrderExample } from '@/config/firebaseExamples'
   - Use in checkout page

KEY PATTERNS:

✓ Always use useEffect + return unsubscribe for real-time listeners
✓ Handle loading and error states
✓ Use async/await for Firebase operations
✓ Clean up subscriptions in component unmount
✓ Update both Firebase and backend if using both

*/

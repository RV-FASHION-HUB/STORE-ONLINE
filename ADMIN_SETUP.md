# Admin Setup Instructions

## How to Create an Admin User

The admin panel is now restricted to admin users only. Regular customers will not see the Admin button.

### Step 1: Create a Regular User Account
1. Login to your R.V Fashion Hub website
2. Click on "Account" → "Login"
3. Sign up as a new customer with any name, phone number, and password

### Step 2: Promote User to Admin in Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click on **Firestore Database** in the left sidebar
4. Navigate to: **Collections → users**
5. Find the user you just created (search by phone number)
6. Click on the user document
7. Look for the `isAdmin` field
8. Click on it and change the value from `false` to `true`
9. Save the changes

### Step 3: Refresh Your Website
1. Go back to your R.V Fashion Hub website
2. Refresh the page (F5 or Ctrl+R)
3. Log out and log back in with your admin user account
4. The **Admin** button should now be visible in the header navigation

## Admin Panel Features
Once logged in as an admin, you can access:
- **Dashboard**: View total products, orders, and revenue
- **Products**: Add, edit, and delete products
- **Inventory**: Manage stock levels by size
- **Orders**: Track and update order status
- **Banner**: Customize the promotional banner
- **About**: Edit the about page content

## Security Notes
- Only set `isAdmin: true` for trusted users who should manage the store
- Each admin user needs their own account
- The admin panel is automatically hidden from non-admin users
- Non-admin users cannot bypass the restriction even if they try to access the URL directly

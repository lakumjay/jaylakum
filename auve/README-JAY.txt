AUVÉ DYNAMIC PROJECT (poora code)
==================================
Chalane ka tarika:
1. Is folder me terminal kholo
2. Command: node server.js
3. Shop: http://localhost:8080
4. Admin: http://localhost:8080/admin.html
5. Admin password: config.js me "adminPassword" wali line me hai (abhi CHANGE-ME-auve-admin hai, pehle use badal lena)

Admin se sab dynamic hai: products, price, colours, fonts, homepage,
Razorpay keys aur Shiprocket login "Payments and Delivery" tab me paste karne hain.
Keys paste karte hi live ho jata hai, koi file edit ya restart nahi chahiye.
Bina keys ke site TEST mode me chalti hai.

Files:
- server.js : poora server (koi extra install nahi chahiye, sirf Node chahiye)
- index.html + app.js : shop ka design
- admin.html + admin.js : admin panel (visual editor ke saath)
- data/ : products.json, settings.json, orders.json (admin ke changes yahi save hote hain)
- lib/shiprocket.js : Shiprocket delivery module
- config.js : fallback settings (password aur purani keys ke liye)

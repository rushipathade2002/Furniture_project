var express = require("express");
var exe = require("./../connection");
var url = require("url");
var router = express.Router();

function checkLogin(req, res, next){
    if(req.session.c_id != undefined){
        next();
    }else{
        res.send("<script>alert('Please Login First'); location.href='/login' </script>");
    } 
}




router.get("/", async(req, res)=>{
    console.log(req.session);
    var banner_info = await exe (`SELECT * FROM banner`);
    var wcu_info = await exe(`SELECT * FROM why_choose_us`);
    var modern_interior = await exe('SELECT * FROM modern_interior');
    var wcup = await exe(`SELECT * FROM why_choose_us_point ORDER BY wcup_id DESC LIMIT 4`);
    var product = await exe('SELECT * FROM product ORDER BY product_id DESC LIMIT 4');
    var testimonial = await exe(`SELECT * FROM testimonial ORDER BY c_id DESC LIMIT 6`);
    var obj = {
        "banner_info":banner_info[0],
        "wcu_info":wcu_info[0],
        "modern_data":modern_interior[0],
        "wcup":wcup,
        "product":product,
        "testimonial":testimonial,
        "isLogin":((req.session.c_id)? true:false),
    };
    res.render("user/home.ejs", obj);
});

router.get("/login", (req, res)=>{
    obj = {
        "isLogin":((req.session.c_id) ? true : false ),
    }
    res.render("user/login.ejs", obj);
});

router.get("/admin_login", (req, res)=>{
    obj = {
        "isLogin":((req.session.c_id)? true:false),
    }
    res.render("user/admin_login.ejs", obj);
});

router.post("/admin_login",async (req, res)=>{
    var d = req.body;
    var sql = `SELECT * FROM admin WHERE admin_mobile = '${d.admin_mobile}' AND admin_password = '${d.admin_password}'`;
    
    var data = await exe (sql); 
    if(data.length > 0){
        req.session.admin_id = data[0].admin_id;
        res.redirect("/admin");
    }else{ 
        res.send("<script>alert('Invalid Credential'); history.back(); </script>")
    }
});

router.get("/signup", (req, res)=>{
    obj = {
        "isLogin":((req.session.c_id)? true:false),
    }
    res.render("user/signup.ejs",obj);
});

router.post("/do_register",async (req, res)=>{
    // var data= await exe( `CREATE TABLE customer(c_id INT PRIMARY KEY AUTO_INCREMENT, c_name VARCHAR(100), c_mobile VARCHAR(15), c_email VARCHAR(70), c_password VARCHAR(200))`);
    var d = req.body;
    var sql = `INSERT INTO customer (c_name, c_email, c_mobile, c_password) VALUES 
            ('${d.c_name}', '${d.c_email}','${d.c_mobile}','${d.c_password}')`;
    var data = await exe(sql);
    res.redirect("/login");
});

// CREATE TABLE customer(c_id INT PRIMARY KEY AUTO_INCREMENT, c_name VARCHAR(100), c_mobile VARCHAR(15), c_email VARCHAR(70), c_password VARCHAR(200));


router.post("/do_login",async (req, res)=>{
    var d = req.body;
    var sql = `SELECT * FROM customer WHERE c_mobile = '${d.c_mobile}' AND c_password = '${d.c_password}'`;
    
    var data = await exe (sql); 
    if(data.length > 0){
        req.session.c_id = data[0].c_id;
        res.redirect("/");
    }else{ 
        res.send("<script>alert('Invalid Credential'); history.back(); </script>")
    }
});


router.get("/shop",async function (req, res){
    var total_product = (await exe("SELECT COUNT(product_id) as total  FROM product"))[0].total;
    var per_page = 8;
    var total_pages = (parseInt(total_product / per_page) < total_product) ? parseInt(total_product/per_page)+1:parseInt(total_product/per_page);
    var url_data = url.parse(req.url, true).query;
    var page_no = 1;
    if(url_data.page_no){
        page_no = url_data.page_no;
    }
    var start = (page_no * per_page)-per_page;
    var products = await exe(`SELECT * FROM product LIMIT ${start}, ${per_page}`);
    obj = {
        "isLogin":((req.session.c_id)? true:false),
        "products":products,
        "total_pages":total_pages,
        "page_no":page_no
    };
    res.render("user/shop.ejs", obj);
});

router.get("/about", function(req,res){
    obj = {
        "isLogin":((req.session.c_id)? true:false),
    }
    res.render("user/about.ejs", obj);
});

router.get("/services", function(req, res){
    obj = {
        "isLogin":((req.session.c_id)? true:false),
    }
    res.render("user/services.ejs",obj);
});

router.get("/blog", function(req, res){
    obj = {
        "isLogin":((req.session.c_id)? true:false),
    }
    res.render("user/blog.ejs",obj);
});

router.get("/contact", function(req, res){
    obj = {
        "isLogin":((req.session.c_id)? true:false),
    }
    res.render("user/contactUs.ejs",obj);
});

router.post("/contactUs",async function(req, res){
    var d= req.body;
    var sql = (`CREATE TABLE contactUs (c_id INT PRIMARY KEY AUTO_INCREMENT, fname VARCHAR(50), lname VARCHAR(50), email VARCHAR(70), message TEXT)`);
    var sql = (`INSERT INTO contactUs (fname, lname, email, message) VALUES ('${d.fname}','${d.lname}','${d.email}', '${d.message}')`);
    var data = await exe(sql);
    res.redirect("/contact");
});

router.post("/newsLetter", async(req, res)=>{
    var d= req.body;
    var sql = `CREATE TABLE newLetter(news_id INT PRIMARY KEY AUTO_INCREMENT, name VARCHAR(50), email VARCHAR(80))`;
    var sql = `INSERT INTO newLetter(name, email) VALUES ('${d.name}', '${d.email}')`;
    var data = await exe(sql);
    res.redirect("/contact");
})


router.get("/product_info/:product_id", async function(req,res){
    var product_id = req.params.product_id;
    var product_details = await exe(`SELECT * FROM product, 
    product_type WHERE product_type.product_type_id=product.product_type_id 
    AND product_id = '${product_id}'`); 
   
    var user_id = req.session.c_id;
    var checkCart = await exe(`SELECT * FROM user_cart WHERE 
    user_id = '  ${user_id}' AND product_id = '${product_id}'`);
        console.log(checkCart);
    obj = {
        "product":product_details[0],
        "isLogin":((req.session.c_id) ? true:false),
        "in_cart": ((checkCart.length > 0) ? true : false )
    }
    res.render("user/product_info.ejs", obj);
});


router.get("/add_to_card/:product_id",checkLogin, async function (req, res){
    user_id = req.session.c_id;
    product_id = req.params.product_id
    qty = 1;
    if(user_id == undefined){
        res.send(`<script>alert('Invalid User, Login Now...'); location.href = '/login';</script>`);
    }else{
        var sql = `SELECT * FROM user_cart WHERE user_id = '  ${user_id}' AND product_id = '${product_id}'`;

        var check = await exe(sql);
        if(check.length == 0)
        {
                var sql2 = `INSERT INTO user_cart (user_id, product_id, qty)VALUES
                ('${user_id}','${product_id}','${qty}')`;
                var data = await exe(sql2);
        }
        res.redirect("/product_info/"+product_id);
    }
});


router.get("/cart",checkLogin, async function(req, res){
    var user_id = req.session.c_id;

    var cart_products = await exe( `SELECT * FROM user_cart, product WHERE 
    product.product_id = user_cart.product_id AND user_id = '${user_id}'`)
    obj = {
        "isLogin":((req.session.c_id)? true:false),
        "products":cart_products,
    }
    res.render("user/cart.ejs",obj);    
});


router.get("/decrease_qty/:cart_id", checkLogin, async function (req,res){
    var user_cart_id = req.params.cart_id;
    var sql = `SELECT * FROM user_cart, product WHERE 
    product.product_id = user_cart.product_id AND cart_id = '${user_cart_id}'`;
    var data = await exe(sql);
    var new_qty = data[0].qty - 1 ;
    var price = data[0].product_price;
    
    if(new_qty > 0 ){
        var total = new_qty * price ; 
        var sql2 = `UPDATE user_cart SET qty = '${new_qty}' WHERE cart_id = '${user_cart_id}'`;
        var data =await exe (sql2);
        res.send({"new_qty":new_qty, "total":total});
    }else{
        var total = data[0] * price ; 
        res.send({"new_qty":data[0].qty, "total":price});
    }
});


router.get("/increase_qty/:cart_id",checkLogin, async function (req, res){
    var user_cart_id = req.params.cart_id;
    var data = await exe(`UPDATE user_cart SET qty = qty+1 WHERE cart_id = '${user_cart_id}'`);
    var sql = `SELECT * FROM user_cart, product WHERE product.product_id = user_cart.product_id AND cart_id = '${user_cart_id}'`;
    var data = await exe(sql);
    var new_qty = data[0].qty;
    console.log(new_qty);
    var price = data[0].product_price;
    var total = new_qty * price;
    res.send({"new_qty":new_qty, "total":total});

});

router.get("/delete_from_cart/:id",checkLogin, async(req, res)=>{
    var sql = `DELETE FROM user_cart WHERE cart_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/cart");
});

router.get("/checkout", checkLogin, async(req, res)=>{

    var cart_products = await exe(`SELECT * FROM user_cart, product WHERE product.product_id = 
                                    user_cart.product_id AND user_cart.user_id = '${req.session.c_id}'`);
    

    obj = {
        "cart_products":cart_products,
        "isLogin":((req.session.c_id)? true:false),
    }
    res.render("user/checkout.ejs",obj); 
});


router.post("/place_order",checkLogin, async(req, res)=>
{
    req.body.order_date = String(new Date().toISOString()).slice(0, 10);
    var d=req.body;
    var order_status = 'pending';
    if(d.payment_mode == 'online'){
        order_status = 'payment_pending';
    }
    var sql = `INSERT INTO order_tbl(user_id, country, c_fname, c_lname, 
        c_address, c_area, c_state, c_postal_zip, c_email, c_phone, payment_mode, 
        order_date, order_status, payment_status) VALUES
        ('${req.session.c_id}','${d.c_country}','${d.c_fname}','${d.c_lname}',
            '${d.c_address}','${d.c_area}','${d.c_state}','${d.c_postal_zip}','${d.c_email}',
            '${d.c_phone}','${d.payment_mode}','${d.order_date}','${order_status}','pending' )`;
    
    var data = await exe(sql);

    var cart_products = await exe(`SELECT * FROM user_cart, product WHERE product.product_id = 
                                    user_cart.product_id AND user_cart.user_id = '${req.session.c_id}'`);

    for(var i=0; i<cart_products.length; i++){
       let order_id = data.insertId;
       let user_id = req.session.c_id;
       let product_id = cart_products[i].product_id;
       let product_qty = cart_products[i].qty;
       let product_price = cart_products[i].product_price;
       let product_name = cart_products[i].product_name;
       let product_details = cart_products[i].product_details;

        sql = `INSERT INTO order_product(order_id, user_id, product_id, product_qty,product_price, product_name, product_details) 
        VALUES ('${order_id}','${user_id}','${product_id}','${product_qty}','${product_price}','${product_name}','${product_details}')`;
        var records = await exe(sql);
        console.log(records);
        
    }
    var sql = `DELETE FROM user_cart WHERE user_id = '${req.session.c_id}'`;
    await exe(sql);
    if(order_status == 'payment_pending'){
        res.redirect("/pay_payment/"+data.insertId);
        // res.send(data)
    }else{
        res.redirect("/my_orders/");
    }
});

router.get("/pay_payment/:order_id",checkLogin, async function(req, res){

    var order_details =await exe( `SELECT * FROM order_tbl, order_product WHERE order_product.order_id = order_tbl.order_id AND order_tbl.order_id = '${req.params.order_id}'`);
        var subtotal=0; 
        for(var i=0; i<order_details.length;i++){ 
            subtotal +=(order_details[i].product_price * order_details[i].product_qty) 
        }
            var discount=Number(subtotal * 0.2).toFixed(); 
            var gst=Math.ceil(((subtotal - discount) * 0.12)); 
            var total=Math.ceil((subtotal - discount + Number(gst))); 

        var obj = {
            "order_id":req.params.order_id, 
            "order_details":order_details[0],
            "total":total
        }

    res.render("user/pay_payment.ejs",obj); 
});

router.post("/payment_success/:order_id", checkLogin,async function(req, res){
    var order_id = req.params.order_id;
    var transaction_id = req.body.razorpay_payment_id;
    var today = new Date().toISOString().slice(0,10);

    var sql = `UPDATE order_tbl SET order_status = 'pending', payment_status = 'complete',
    transaction_id ='${transaction_id}',payment_date = '${today}' WHERE order_id = '${order_id}'`;
    var data = await exe(sql);
    res.redirect("/my_orders");
});

router.get("/my_orders",checkLogin, async function (req, res){
    var sql = `SELECT *, (SELECT SUM(product_qty* product_price) FROM order_product 
                WHERE order_product.order_id = order_tbl.order_id) AS total_amt FROM
                order_tbl WHERE user_id = '${req.session.c_id}' AND order_status != 'payment_pending'`;
    var orders = await exe(sql);
    var obj  = {
        "isLogin":((req.session.c_id)? true:false),
        "orders":orders
    }
    res.render("user/my_orders.ejs", obj);
});

router.get("/print_order/:id",checkLogin, async function(req, res){
    var order_products =await exe(`SELECT * FROM order_product WHERE order_id = '${req.params.id}'`);
    var order_details = await exe(`SELECT * FROM order_tbl WHERE order_id = '${req.params.id}'`);

    var obj  = {
        "order_products":order_products,
        "order_details":order_details,
        "isLogin":((req.session.c_id)? true:false),
    }
    res.render("user/print_order.ejs",obj);
});

router.get("/profile",checkLogin, async function (req, res){
    var userData = await exe(`SELECT * FROM customer WHERE c_id = '${req.session.c_id}'`);
    var obj  = {
        "isLogin":((req.session.c_id)? true:false),
        "user":userData
    }
    res.render("user/profile_page.ejs",obj)
});


router.get("/edit_profile", checkLogin, async function(req, res){
    var userData = await exe(`SELECT * FROM customer WHERE c_id = '${req.session.c_id}'`);
    var obj  = {
        "isLogin":((req.session.c_id)? true:false),
        "user":userData
    }
    res.render("user/edit_profile.ejs",obj);    
});

router.post("/update_profile", checkLogin, async(req, res)=>{
    var d=req.body;
    await exe(`UPDATE customer SET c_name = '${d.c_name}', c_email = '${d.c_email}',c_mobile = '${d.c_mobile}' WHERE c_id = '${req.session.c_id}'`);
    res.redirect("/profile");
});

router.get("/logout",checkLogin, async(req, res)=>{
        if (req.session) {
            req.session.destroy();
        }
            res.redirect("/");  
});



module.exports = router;

    // CREATE TABLE order_tbl (order_id INT PRIMARY KEY AUTO_INCREMENT,
    // country VARCHAR(50), c_fname VARCHAR(50), c_lname VARCHAR(50), 
    // c_address TEXT, c_area TEXT, c_state VARCHAR(50), c_postal_zip VARCHAR(50),
    // c_email VARCHAR(100), c_phone VARCHAR(15), payment_mode VARCHAR(8), order_date VARCHAR(20));
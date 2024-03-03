var express = require("express");
var url = require("url");
var exe = require("./../connection");
const { route } = require("./user_route");
var router = express.Router();


function checkAdminLogin(req, res, next){
    if(req.session.admin_id != undefined){
        next();
    }else{
        res.send("<script>alert('Admin Login First'); location.href='/admin_login' </script>");
    }
}

router.get("/",checkAdminLogin, function(req, res){
    res.render("admin/home.ejs");
});

router.get("/manage_banner",checkAdminLogin,async function(req, res){
    var banner_info = await exe(`SELECT * FROM banner`);
    var obj = {"banner_info":banner_info};
    res.render("admin/manage_banner.ejs", obj);
});

router.post("/save_banner", checkAdminLogin,async (req, res)=>{

    if(req.files){
        var banner_image = new Date().getTime()+req.files.banner_image.name;
        req.files.banner_image.mv("public/uploads/"+banner_image);
        
        // CREATE TABLE banner(banner_id INT PRIMARY KEY AUTO_INCREMENT, banner_title VARCHAR(200), banner_details TEXT, banner_link TEXT, banner_image TEXT);
        var d= req.body;
        var sql = ` UPDATE banner SET banner_title ='${d.banner_title}',
        banner_details = '${d.banner_details}', banner_link='${d.banner_link}',
        banner_image='${banner_image}' WHERE banner_id = 1`;
        var data = await exe(sql);
    }else{
        var d= req.body;
        var sql = ` UPDATE banner SET banner_title ='${d.banner_title}',
        banner_details = '${d.banner_details}', banner_link='${d.banner_link}'
         WHERE banner_id = 1`;
        var data = await exe(sql);
    }
    // res.send(data);
    res.redirect("/admin/manage_banner")
})

router.get("/product_type",checkAdminLogin,async function(req, res){
    var types = await exe(`SELECT * FROM product_type`);
    var obj = {"types":types};
    res.render("admin/product_type.ejs", obj);
});

router.post("/save_product_type",checkAdminLogin,async (req, res)=>{
    var d= req.body;
    // var sql = `CREATE TABLE product_type(product_type_id INT PRIMARY KEY AUTO_INCREMENT, product_type_name VARCHAR(200))`;
    var sql = `INSERT INTO product_type(product_type_name) VALUES ('${d.product_type_name}')`;
    var data = await exe(sql);
    res.redirect("/admin/product_type");
});

router.get("/edit_product_type/:id",checkAdminLogin,async (req, res)=>{
    var edit_product_type = await exe(`SELECT * FROM product_type WHERE product_type_id = '${req.params.id}'`);
    var obj = {"product_type":edit_product_type[0]};
    res.render("admin/edit_product_type.ejs", obj);
});

router.post("/update_product_type", checkAdminLogin,async(req, res)=>{
    var update_data = await exe(`UPDATE product_type SET product_type_name='${req.body.product_type_name}' WHERE product_type_id = '${req.body.product_type_id}'`);
    // res.send(update_data);
    res.redirect("/admin/product_type");
});

router.get("/delete_product_type/:id", checkAdminLogin,async (req, res)=>{
    var delete_data = await exe(`DELETE FROM product_type WHERE product_type_id = '${req.params.id}'`);
    res.redirect("/admin/product_type");
});

router.get("/product", checkAdminLogin,async function(req, res){
    var types = await exe(`SELECT * FROM product_type`);
    var obj = {"types":types};
    res.render("admin/product.ejs", obj);
});

router.post("/save_product",checkAdminLogin,async (req, res)=>{
    
    // var sql = `CREATE TABLE product (product_id INT PRIMARY KEY AUTO_INCREMENT, 
    //     product_type_id INT, product_name TEXT, product_price INT, duplicate_price INT, 
    //     product_size VARCHAR(200), product_color VARCHAR(20), product_label VARCHAR(100), 
    //     product_details TEXT, product_image TEXT)`;

    if(req.files){
        if(req.files.product_image[0]){
            var file_names = [];
            console.log("Multiple img upload");
            for(var i=0; i<req.files.product_image.length; i++){
                var fn= new Date().getTime() + req.files.product_image[i].name;
                req.files.product_image[i].mv("public/uploads/"+fn);
                file_names.push(fn);
            }
            var file_name = file_names.join("~");
        }else{
            var file_name = new Date().getTime()+req.files.product_image.name;
            req.files.product_image.mv("public/uploads/"+file_name);
        }
            var d= req.body;
            d.product_details = d.product_details.replaceAll("'","`");
            var sql = `INSERT INTO product(product_type_id, product_name, product_price, duplicate_price,
                product_size, product_color, product_label, product_details, product_image)VALUES
                ('${d.product_type}','${d.product_name}','${d.product_price}','${d.duplicate_price}','${d.product_size}',
                '${d.product_color}','${d.product_label}','${d.product_details}','${file_name}')`;
    }else{
        var d= req.body;
        d.product_details = d.product_details.replaceAll("'","`");
        var sql = `INSERT INTO product(product_type_id, product_name, product_price, duplicate_price,
            product_size, product_color, product_label, product_details)VALUES
            ('${d.product_type}','${d.product_name}','${d.product_price}','${d.duplicate_price}','${d.product_size}',
            '${d.product_color}','${d.product_label}','${d.product_details}')`;
    }
    var data = await exe(sql);
    console.log(req.files);
    res.redirect("/admin/product");
});

router.get("/product_list",checkAdminLogin,async function(req, res){
    var products = await exe("SELECT * FROM product, product_type WHERE product.product_type_id = product_type.product_type_id");
    var obj = {"products":products};
    res.render("admin/product_list.ejs",obj);
});

router.get("/edit_product/:id", checkAdminLogin,async function(req, res){
    // var edit_product = await exe(`SELECT * FROM product, product_type WHERE product.product_type_id = product_type.product_type_id AND product_type.product_type_id = '${req.params.id}'`);
    var product_info = await exe(` SELECT * FROM product WHERE product_id = '${req.params.id}'`);
    var types = await exe(`SELECT * FROM product_type`);
    var obj = {"product_info":product_info[0], "types":types};
    res.render("admin/edit_product.ejs", obj);
});

router.post("/update_product", checkAdminLogin,async (req, res)=>{
    if(req.files){
        if(req.files.product_image[0]){
            var file_names = [];
            console.log("Multiple img upload");
            for(var i=0; i<req.files.product_image.length; i++){
                var fn= new Date().getTime() + req.files.product_image[i].name;
                req.files.product_image[i].mv("public/uploads/"+fn);
                file_names.push(fn);
            }
            var file_name = file_names.join("~");
        }else{
            var file_name = new Date().getTime()+req.files.product_image.name;
                    req.files.product_image.mv("public/uploads/"+file_name);
        }
            var d= req.body;
            var update_product = await exe(`UPDATE product SET product_image = '${file_name}' WHERE product_id = '${d.product_id}'`);
    }else{
        var d= req.body;
        d.product_details = d.product_details.replaceAll("'","`");
        var update_product = await exe(`UPDATE product SET product_name='${d.product_name}', 
        product_type_id = '${d.product_type_id}', product_price = '${d.product_price}',
        duplicate_price = '${d.duplicate_price}', product_size = '${d.product_size}', 
        product_color ='${d.product_color}',product_label ='${d.product_label}',
        product_details ='${d.product_details}' WHERE product_id = '${d.product_id}'`);
    }
    res.redirect("/admin/product_list");
    console.log(update_product);
});

router.get("/delete_product_image/:id/:img",checkAdminLogin,async function (req, res){
    var data = await exe(`SELECT * FROM product WHERE product_id = '${req.params.id}'`);
    var new_image = data[0]['product_image'].replace(req.params.img,"");
    var sql = `UPDATE product SET product_image = '${new_image}' WHERE product_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/edit_product/"+req.params.id);
})

router.get("/delete_product/:id", checkAdminLogin,async(req, res)=>{
    var delete_product = await exe(`DELETE FROM product WHERE product_id = '${req.params.id}'`);
    res.redirect("/admin/product_list")
});

router.get("/product_search", checkAdminLogin,async function(req, res){
    var url_data = url.parse(req.url, true).query;
    var str = url_data.str;
    var sql =  `SELECT * FROM product, product_type WHERE product.product_type_id = product_type.product_type_id AND 
    (product_name LIKE '%${str}%' OR product_type_name LIKE '%${str}%' OR product_size LIKE '%${str}%' 
    OR product_price LIKE '%${str}%' OR product_label LIKE '%${str}%' || product_details LIKE '%${str}%')`;
    var products = await exe(sql);
    var obj = {"products":products};
    res.render("admin/product_list.ejs",obj);

})


// Why Choose Us Point
router.get("/why_choose_us_heading",checkAdminLogin,async (req, res)=>{
    let wcu_info = await exe(`SELECT * FROM why_choose_us`);
    let obj = {"wcu_info":wcu_info[0]};
    res.render("admin/whyChooseUsHeading.ejs", obj);
});

router.post("/save_why_choose_us", checkAdminLogin,async (req, res)=>{
    let d= req.body;
        let sql = ` UPDATE why_choose_us SET wcu_heading ='${d.wcu_heading}',
        wcu_details = '${d.wcu_details}' WHERE wcu_id = 1`;
        let data = await exe(sql);
    res.redirect("/admin/why_choose_us_heading");
    // console.log(data);
});

router.get("/why_choose_us_points", checkAdminLogin,async(req, res)=>{
    let points = await exe(`SELECT * FROM why_choose_us_point`);
    const obj = {"points":points};
    res.render("admin/whyChooseUsPoint.ejs", obj);
});

router.post("/save_why_choose_us_points", checkAdminLogin,async (req, res)=>{

    // var sql = `CREATE TABLE why_choose_us_point(wcup_id INT PRIMARY KEY AUTO_INCREMENT, 
    //     wcup_name VARCHAR(200), wcup_details TEXT, wcup_image TEXT)`;

    var d=req.body;
    if(req.files){
        var wcup_image = new Date().getTime()+req.files.wcup_image.name;
        req.files.wcup_image.mv("public/uploads/"+wcup_image);
        var sql =`INSERT INTO why_choose_us_point(wcup_name, wcup_details, wcup_image)
                VALUES ('${d.wcup_name}','${d.wcup_details}','${wcup_image}')`;
        var data = exe(sql);
    }else{
            sql =`INSERT INTO why_choose_us_point(wcup_name, wcup_details)
                VALUES ('${d.wcup_name}','${d.wcup_details}')`;
            data = exe(sql);
    }
    res.redirect("/admin/why_choose_us_points");
});

router.get("/delete_point/:id",checkAdminLogin,async(req, res)=>{
    let delete_point = await exe(`DELETE FROM why_choose_us_point WHERE wcup_id = '${req.params.id}'`);
    res.redirect("/admin/why_choose_us_points");
});

router.get("/edit_point/:id", checkAdminLogin,async (req, res)=>{
    var wcup = await exe(`SELECT * FROM why_choose_us_point WHERE wcup_id = '${req.params.id}'`);
    var obj = {"wcup":wcup};
    res.render("admin/edit_whyChooseUsPoint.ejs",obj);
});

router.post("/update_why_choose_us_points", checkAdminLogin,async(req, res)=>{
    var d= req.body;
    if(req.files){
        var wcup_image = new Date().getTime() + req.files.wcup_image.name;
                    req.files.wcup_image.mv("public/uploads/"+wcup_image);
        await exe(`UPDATE why_choose_us_point SET wcup_image='${wcup_image}' WHERE wcup_id = '${d.wcup_id}'`);    
    }
    var sql = `UPDATE why_choose_us_point SET wcup_name='${d.wcup_name}',wcup_details='${d.wcup_details}' 
                WHERE wcup_id ='${d.wcup_id}'`;
    var data = await exe(sql);
    res.redirect("/admin/why_choose_us_points");
    
    
});
// end Why Choose us


// modern Interior Banner
router.get("/modern_interior", checkAdminLogin,async (req, res)=>{
    let modern_data = await exe(`SELECT * FROM modern_interior`);
    res.render("admin/modern_interior.ejs",{"modern_data":modern_data});
});

router.post("/update_modern_interior", checkAdminLogin,async(req, res)=>{
    var d = req.body;

        if(req.files){
            if(req.files.image1 !=null){
                var image1 = new Date().getTime()+req.files.image1.name;
                req.files.image1.mv("public/uploads/"+image1);
                await exe(`UPDATE modern_interior SET image1 = '${image1}' WHERE id = '${d.id}'`);
            }
            if(req.files.image2 !=null){
                var image2 = new Date().getTime()+req.files.image2.name;
                req.files.image2.mv("public/uploads/"+image2);
                await exe(`UPDATE modern_interior SET image2 = '${image2}' WHERE id = '${d.id}'`);
            }
            if(req.files.image3 !=null){
                var image3 = new Date().getTime()+req.files.image3.name;
                req.files.image3.mv("public/uploads/"+image3);
                await exe(`UPDATE modern_interior SET image3 = '${image3}' WHERE id = '${d.id}'`);
            }
        }
            var sql = ` UPDATE modern_interior SET heading ='${d.heading}',
                details = '${d.details}', key_point1='${d.key_point1}',
                key_point2='${d.key_point2}', key_point3='${d.key_point3}', 
                key_point4='${d.key_point4}' WHERE id = 1`;
            var data = await exe(sql);
            console.log(req.files);
        res.redirect("/admin/modern_interior");
});
// end Modern Interior


// testimonial start
router.get("/testimonial", checkAdminLogin,async (req, res)=>{
    var testimonial =await exe( `SELECT * FROM testimonial`);
    console.log(req.session.admin_id);
    res.render("admin/testimonial.ejs",{"testimonial":testimonial});
});

router.post("/save_testimonial", checkAdminLogin,async(req, res)=>{
    
    var sql = `CREATE TABLE testimonial(c_id INT PRIMARY KEY AUTO_INCREMENT, 
                c_name VARCHAR(200),c_position TEXT, c_message TEXT, c_image TEXT)`;
    var d= req.body;
    var c_image = new Date().getTime() + req.files.c_image.name;
                req.files.c_image.mv("public/uploads/"+c_image);
    sql = `INSERT INTO testimonial(c_name,c_message, c_position, c_image) VALUES
            ('${d.c_name}','${d.c_message}','${d.c_position}','${c_image}')`;
    var data = await exe(sql);
    res.redirect("/admin/testimonial");

});

router.get("/delete_testimonial/:id", checkAdminLogin,async(req, res)=>{
    var delete_product = await exe(`DELETE FROM testimonial WHERE c_id = '${req.params.id}'`);
    res.redirect("/admin/testimonial");
});

router.get("/edit_testimonial/:id", checkAdminLogin,async (req, res)=>{
    var testimonials = await exe(`SELECT * FROM testimonial WHERE c_id = '${req.params.id}'`);
    var obj = {"testimonials":testimonials};
    res.render("admin/edit_testimonial.ejs", obj);
});

router.post("/update_testimonial", checkAdminLogin,async(req, res)=>{
    var d= req.body;
    if(req.files){
        var c_image = new Date().getTime() + req.files.c_image.name;
                    req.files.c_image.mv("public/uploads/"+c_image);
        await exe(`UPDATE testimonial SET c_image='${c_image}' WHERE c_id = ${d.c_id}`);    
    }
    var sql = `UPDATE testimonial SET c_name='${d.c_name}',c_position='${d.c_position}',
                c_message='${d.c_message}' WHERE c_id = ${d.c_id}`;
    var data = await exe(sql);
    res.redirect("/admin/testimonial");
    
});
// end testimonial 



// start blogs
router.get("/blogs", checkAdminLogin,async(req, res)=>{
    
    res.render("admin/blogs.ejs");
});

router.post("/save_blogs", checkAdminLogin,async (req, res)=>{
    var sql = `CREATE TABLE blogs (blog_id INT PRIMARY KEY AUTO_INCREMENT, 
        blog_title VARCHAR(200), blog_date date, blog_time VARCHAR(50), blogPostBy TEXT,
        blogPostByPosition TEXT,blog_image TEXT, blog_details TEXT)`;
    if(req.files){
        var d = req.body;
        var blogImage = new Date().getTime()+req.files.blog_image.name;
                    req.files.blog_image.mv("public/uploads/"+blogImage);
        var sql = `INSERT INTO blogs(blog_title, blog_date, blog_time, blogPostBy, blogPostByPosition, 
            blog_image, blog_details) VALUES ('${d.blog_title}','${d.blog_date}','${d.blog_time}','${d.blogPostBy}',
            '${d.blogPostByPosition}', '${blogImage}','${d.blog_details}')`;
        var data = await exe (sql);
    }
    res.redirect("/admin/blogs");
});

router.get("/blog_list", checkAdminLogin,async(req, res)=>{
    var blogs = await exe(`SELECT * FROM blogs`);
    res.render("admin/blog_list.ejs", {"blogs":blogs});
});

router.get("/delete_blog/:id", checkAdminLogin,async(req, res)=>{
    var data = await exe(`DELETE FROM blogs WHERE blog_id = '${req.params.id}'`);
    res.redirect("/admin/blog_list");
});

router.get("/edit_blog/:id", checkAdminLogin,async (req, res)=>{
    var editBlogs = await exe(`SELECT * FROM blogs WHERE blog_id = ${req.params.id}`);
    var obj ={
        blogs:editBlogs
    }
    res.render("admin/edit_blog.ejs",obj);
});

router.post("/update_blog", checkAdminLogin,async(req, res)=>{
    var d= req.body;
    if(req.files){
        var blog_image = new Date().getTime() + req.files.blog_image.name;
                    req.files.blog_image.mv("public/uploads/"+blog_image);
        await exe(`UPDATE blogs SET blog_image='${blog_image}' WHERE blog_id = ${d.blog_id}`);    
    }
    var sql = `UPDATE blogs SET blog_title='${d.blog_title}',blog_date='${d.blog_date}',
                blog_time='${d.blog_time}', blogPostBy='${d.blogPostBy}',blogPostByPositionz='${d.blogPostByPosition}',
                blog_details='${d.blog_details}' WHERE blog_id = ${d.blog_id}`;
    var data = await exe(sql);
    console.log(d.blog_date);
    res.redirect("/admin/blog_list");
    
});
// end Blogs 


// Start Team 
router.get("/addTeam",checkAdminLogin,async (req, res)=>{
    var data = await exe(`SELECT * FROM owner`);
    res.render("admin/owner.ejs",{"owner":data});
});

router.post("/save_team", checkAdminLogin,async(req, res)=>{
    // var data= await exe(`CREATE TABLE owner(owner_id INT PRIMARY KEY AUTO_INCREMENT, team_name VARCHAR(100), team_position VARCHAR(200), profile_link TEXT, team_image TEXT)`);
    var d= req.body;
    if(req.files){
        var owner_image = new Date().getTime()+req.files.team_image.name;
        req.files.team_image.mv("public/uploads/"+owner_image);
        var sql = `INSERT INTO owner( team_name, team_position,owner_details, profile_link, team_image) 
            VALUES ('${d.team_name}','${d.team_position}','${d.team_details}','${d.profile_link}','${owner_image}')`;
        var data = await exe(sql);

    }else{
        var sql = `INSERT INTO owner( team_name, team_position,owner_details, profile_link, team_image) 
            VALUES ('${d.team_name}','${d.team_position}','${d.team_details}','${d.profile_link}')`;
             data = await exe(sql);
    }
    res.redirect("/admin/addTeam");
});

router.get("/edit_owner/:id",checkAdminLogin,async(req, res)=>{
    var owner = await exe(`SELECT * FROM owner WHERE owner_id = '${req.params.id}'`);
    var obj = {"owner":owner}
    res.render("admin/edit_owner.ejs", obj);
});

router.post("/update_team", checkAdminLogin,async (req, res)=>{
    var d= req.body;
    if(req.files){
        var owner_image = new Date().getTime()+req.files.owner_image.name;
                    req.files.owner_image.mv("public/uploads/"+owner_image);
            await exe( `UPDATE owner SET team_image = '${owner_image}'  WHERE owner_id = '${d.owner_id}'`);

    }
        var sql = `UPDATE owner SET team_name = '${d.team_name}', team_position = '${d.team_position}',
                owner_details = '${d.owner_details}', profile_link = '${d.profile_link}' WHERE owner_id = '${d.owner_id}'`;
        var data = await exe(sql);
        res.redirect("/admin/addTeam");
});

router.get("/delete_owner/:id", checkAdminLogin,async(req, res)=>{
        await exe(`DELETE FROM owner WHERE owner_id = '${req.params.id}'`);
        res.redirect("/admin/addTeam");
});

router.get("/contactus", checkAdminLogin,async (req, res)=>{
    var contactus = await exe(`SELECT * FROM contactus`);
    var obj = {
        "contactus":contactus
    }
    res.render("admin/contactUs.ejs", obj);
});

router.get("/deleteContactUs/:id", checkAdminLogin,async (req, res)=>{
    await exe(`DELETE FROM contactus WHERE c_id = '${req.params.id}'`);
    res.redirect("/admin/contactus");
})

router.get("/newsletter", checkAdminLogin,async (req, res)=>{
    var newsletter = await exe(`SELECT * FROM newletter`);
    var obj = {
        "newsletter":newsletter
    }
    res.render("admin/newsLetter.ejs", obj);
});

router.get("/deleteNewsLetter/:id", checkAdminLogin,async (req, res)=>{
    await exe(`DELETE FROM newletter WHERE news_id = '${req.params.id}'`);
    res.redirect("/admin/newsletter");
});


router.get("/pending_order", checkAdminLogin,async (req, res)=>{
    var sql = `SELECT *, (SELECT SUM(product_qty*product_price) 
    FROM order_product WHERE order_product.order_id = order_tbl.order_id) 
    AS total_amt FROM order_tbl WHERE order_status = 'pending'`;
    var pending_orders = await exe(sql);
    var obj ={
        "orders":pending_orders
    }
    res.render("admin/pending_order.ejs", obj);
});

router.get("/view_order/:id", checkAdminLogin,async(req, res)=>{
    var data = await exe(`SELECT * FROM order_tbl 
                    WHERE order_id = '${req.params.id}'`);
    var products = await exe(`SELECT * FROM order_product 
                    WHERE order_id = '${req.params.id}'`);
    var obj = {
        "order_info":data,
        "products":products
    }
    res.render("admin/view_order.ejs", obj);
});

router.get("/dispatch_order/:id", checkAdminLogin,async (req, res)=>{
    var today = new Date().toISOString().slice(0, 10);
    var sql =  `UPDATE order_tbl SET order_dispatch_date = '${today}', 
                order_status = 'dispatch' WHERE order_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/pending_order");
});

router.get("/dispatch_order", checkAdminLogin,async (req, res)=>{
    var dispatch_orders = await exe(`SELECT *, (SELECT SUM(product_qty*product_price) 
    FROM order_product WHERE order_product.order_id = order_tbl.order_id) 
    AS total_amt FROM order_tbl WHERE order_status = 'dispatch'`);
    var obj = {
        "orders":dispatch_orders
    }
    res.render("admin/dispatch_order.ejs", obj);
});

router.get("/shipping_order/:id", checkAdminLogin,async(req, res)=>{
    var today = new Date().toISOString().slice(0, 10);
    var sql =  `UPDATE order_tbl SET order_dispatch_date = '${today}', 
                order_status = 'shipped' WHERE order_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/dispatch_order");
});

router.get("/shipping_order", checkAdminLogin,async(req, res)=>{
    var dispatch_orders = await exe(`SELECT *, (SELECT SUM(product_qty*product_price) 
    FROM order_product WHERE order_product.order_id = order_tbl.order_id) 
    AS total_amt FROM order_tbl WHERE order_status = 'shipped'`);
    var obj = {
        "orders":dispatch_orders
    }
    res.render("admin/shipping_order.ejs", obj);
});

router.get("/delivered_order/:id", checkAdminLogin,async(req, res)=>{
    var today = new Date().toISOString().slice(0, 10);
    var sql =  `UPDATE order_tbl SET order_dispatch_date = '${today}', 
                order_status = 'delivered' WHERE order_id = '${req.params.id}'`;
    var data = await exe(sql);
    res.redirect("/admin/shipping_order");
});

router.get("/delivered_order", checkAdminLogin,async(req, res)=>{
    var dispatch_orders = await exe(`SELECT *, (SELECT SUM(product_qty*product_price) 
    FROM order_product WHERE order_product.order_id = order_tbl.order_id) 
    AS total_amt FROM order_tbl WHERE order_status = 'delivered'`);
    var obj = {
        "orders":dispatch_orders
    }
    res.render("admin/delivered_order.ejs", obj);
});


router.get("/admin_logout", async(req, res)=>{
        if (req.session) {
            req.session.destroy();
        }
            res.redirect("/");  
});


module.exports = router;
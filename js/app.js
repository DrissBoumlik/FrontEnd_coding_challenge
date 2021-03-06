$(function (){
    var logged, registred, user_name, _location;
    var current_page;
    // Verifying if the use is logged  
    
    var menu_items = $('#menu-main-menu li');
    current_page = localStorage.getItem('current_page') == null ? 0 : localStorage.getItem('current_page'); 
    
    getLocation(); 
    if(logged = is_logged()){
        $('#register-form').addClass('hidden');
        $('#login-form').addClass('hidden');
        $('#logout').removeClass('hidden');
        $('#user-name').text('Hello ' + localStorage.getItem('user_name'));
        current_page == 0 ? preferred_shops() : nearby_shops();
    }
    
    //#region SECTION: Signin / Signup Events
    $('.form-signup').on('submit',function (e){
        var name = $('#name-reg').val()
        var email = $('#email-reg').val()
        var password = $('#pass-reg').val()
        var password_confirm = $('#pass-reg-confirm').val()
        
        if(password != password_confirm){
            modal_message("Passwords are note matched");
            return false;
        }
        // e.preventDefault();
        getLocation();
        register(name, email, password, password_confirm, _location);
        return false;
    })
    
    $('.form-signin').on('submit',function (e){
        var email = $('#email-log').val()
        var password = $('#pass-log').val()       
        e.preventDefault(); 
        login(email, password);
        return false;
    });
    
    //#endregion
    
    // #region SECTION: Menu Event
    $('#menu-main-menu').delegate('li', 'click', function (){
        $(this).addClass('active').siblings().removeClass('active');
        var section_id = $(this).attr('data-section');
        if(logged)
            (section_id == 'nearby-shops') ? nearby_shops() : preferred_shops();
        else modal_message('You need to Register / Login first')
    });
    $('#logout').on('click', function () {
        logout();
    })
    
    // #endregion
    
    // #region SECTION: Authentication functions
    
    function is_logged(){
        var token = localStorage.getItem('token');
        if(token == null){
            $('#register-form').removeClass('hidden');
            $('#login-form').removeClass('hidden');
            $('#logout').addClass('hidden');            
            return false;
        }
        return true;
    }
    
    function register(name, email, password, password_confirm, user_location) {
        $.ajax({
            method: 'POST', // Type of response and matches what we said in the route
            url: 'http://127.0.0.1:8000/api/register', // This is the url we gave in the route
            data: {'name': name, 'email': email, 'password': password, 'password_confirm': password_confirm, 'user_location': user_location},
            success: function(response){ // What to do if we succeed
                registred = true;
                $('#register-form').addClass('hidden');
                $('#login-form').removeClass('hidden');
                login(email, password);
                return registred;
            },
            error: function(jqXHR, textStatus, errorThrown) { // What to do if we fail
                // console.log(JSON.stringify(jqXHR));
                var error = JSON.parse(jqXHR.responseText).error;
                if(error.email != null)
                    modal_message(error.email[0]);
                $('#register-form').removeClass('hidden');
                $('#login-form').removeClass('hidden');
                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
                return register;
            }
        }, 100);
    }
    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.watchPosition(function(position) {
                _location = position.coords.longitude + '|' + position.coords.latitude;
            });
        } else {
            modal_message("Geolocation is not supported by this browser.");
        }
    }
    function login(email, password) {
        $.ajax({
            method: 'POST', // Type of response and matches what we said in the route
            url: 'http://127.0.0.1:8000/api/login', // This is the url we gave in the route
            data: {'email': email, 'password': password},
            success: function(response){ // What to do if we succeed
                user_name = response.success.user.name;
                $('#user-name').text('Hello ' + user_name);
                localStorage.setItem('user_name', user_name);
                localStorage.setItem('token', response.success.token);
                logged = true;
                $('#register-form').addClass('hidden');
                $('#login-form').addClass('hidden');
                $('#logout').removeClass('hidden');
                preferred_shops();
            },
            error: function(jqXHR, textStatus, errorThrown) { // What to do if we fail
                // console.log(JSON.stringify(jqXHR));
                logged = false;
                modal_message('Email and/or Password Incorrect')
                $('#login-form').removeClass('hidden');
                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
            }
        });
    }
    
    function logout(){
        $.ajax({
            method: 'GET', // Type of response and matches what we said in the route
            url: 'http://127.0.0.1:8000/api/logout', // This is the url we gave in the route
            headers: {"Authorization": 'Bearer ' + localStorage.getItem('token'), Accept: "application/json"},
            success: function(response){ // What to do if we succeed
                $('#register-form').removeClass('hidden');
                $('#login-form').removeClass('hidden');
                $('#user-name').addClass('hidden')
                $('#logout').addClass('hidden')
                localStorage.removeItem('user_name')
                localStorage.removeItem('token')
                logged = false;
                location.reload();
            },
            error: function(jqXHR, textStatus, errorThrown) { // What to do if we fail
                // console.log(JSON.stringify(jqXHR));
                logged = true;
                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
            }
        });
    }
    //#endregion
    
    // #region SECTION: Shops functionnalities
    function remove_shop(shop_id){
        $.ajax({
            method: 'DELETE', // Type of response and matches what we said in the route
            url: 'http://127.0.0.1:8000/api/shopusers/'+shop_id, // This is the url we gave in the route
            headers: {"Authorization": 'Bearer ' + localStorage.getItem('token'), Accept: "application/json"},
            success: function(response){ // What to do if we succeed
                localStorage.setItem('msg', response.message);
                console.log(localStorage.getItem('msg'))
                setTimeout(function (){
                    modal_message(localStorage.getItem('msg'));
                }, 1000);
                (current_page == 1) ? nearby_shops() : preferred_shops();
                
            },
            error: function(jqXHR, textStatus, errorThrown) { // What to do if we fail
                //console.log(JSON.stringify(jqXHR));
                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
            }
        });
    }
    
    function like_shop(shop_id, is_liked) {
        $.ajax({
            method: 'POST', // Type of response and matches what we said in the route
            url: 'http://127.0.0.1:8000/api/shopusers/', // This is the url we gave in the route
            data: {'shop_id' : shop_id, 'is_liked' : is_liked}, // a JSON object to send back
            headers: {"Authorization": 'Bearer ' + localStorage.getItem('token'), Accept: "application/json"},
            success: function(response){ // What to do if we succeed
                var shop = response.shop;
                $('#'+shop_id+' .btn.like').prop('disabled', shop.is_liked == 1 ? true : false);
                $('#'+shop_id+' .btn.dislike').prop('disabled', shop.is_liked == 1 ? false : true);
                // (current_page == 1) ? nearby_shops() : preferred_shops();
            },
            error: function(jqXHR, textStatus, errorThrown) { // What to do if we fail
                //console.log(JSON.stringify(jqXHR));
                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
            }
        });
    }
    
    function nearby_shops(page_number = 1){
        current_page = 1;
        localStorage.setItem('current_page', 1);
        $(menu_items[0]).addClass('active')
        $(menu_items[1]).removeClass('active');
        shops(page_number, 0);
    }    
    function preferred_shops(page_number = 1) {
        current_page = 0;
        localStorage.setItem('current_page', 0);
        $(menu_items[1]).addClass('active')
        $(menu_items[0]).removeClass('active');
        shops(page_number, 1);
    }    
    function shops(page_number = 1, liked_shops = 1){
        $('#preferred-shops').remove();
        $('#nearby-shops').remove();
        var data = {'page' : page_number};
        $.ajax({
            method: 'GET', //(liked_shops == 1) ? 'GET' : 'POST', // Type of response and matches what we said in the route
            url: 'http://127.0.0.1:8000/api/shops'+ (liked_shops == 1 ? '/likedshops' : '/'), // This is the url we gave in the route
            data: data, // a JSON object to send back
            headers: {"Authorization": 'Bearer ' + localStorage.getItem('token'), Accept: "application/json"},
            success: function(response){ // What to do if we succeed
                var data = response.shops.data;
                if(data.length > 0){
                    var current_page = response.shops.current_page;
                    template = $.trim($('#template').html());
                    var content = '';
                    $.each(data, function(index, object){
                        var tmp = template.replace(/{{shop_name}}/ig, object.name)
                                            .replace(/{{shop_img}}/ig, object.thumbnail)
                                            .replace(/{{shop_id}}/ig, object.id);
                        content += tmp;
                    }); 
                    last_page = response.shops.last_page;
                    pages = $.trim($('#pages').html());
                    _pages = '';
                    for(i=1; i<=last_page; i++){
                        page = pages.replace(/{{page_number}}/ig, i)
                        _pages += page;
                    }
                    text = ((liked_shops != 1) 
                                    ? '<div id="nearby-shops" class="container nearby-shops"><div class="row"><div class="col-md-6 col-md-offset-3 title"><h2>NearBy Shops</h2></div></div>' 
                                    : '<div id="preferred-shops" class="container preferred-shops"><div class="row"><div class="col-md-6 col-md-offset-3 title"><h2>Here is your Preferred Shops</h2></div></div>')
                    text += '<div class="container shops"><div class="row">'+content+'</div></div>';
                    text += '<div class="pages-index container">'+_pages+'</div></div>' + '</div>';
                    $(document.body).append(text);
                    setTimeout(function () {
                        if(liked_shops == 1) { $('.btn.like, .btn.dislike').addClass('hidden'); $('.btn.remove').removeClass('hidden')}
                        $('.pages-index #page_'+current_page).addClass('active');
                        $('.pages-index').delegate('.page', 'click', function () {
                            (liked_shops == 1) ? preferred_shops($(this).text()) :  nearby_shops($(this).text());
                        })
                        $('.shops').delegate('.like', 'click', function () {  
                            var shop_id = $(this).closest('.wrapper').attr('id');
                            like_shop(shop_id, 1);
                        })
                        $('.shops').delegate('.dislike', 'click', function () {  
                            var shop_id = $(this).closest('.wrapper').attr('id');
                            like_shop(shop_id, 0);
                        })
                        $('.shops').delegate('.remove', 'click', function () {  
                            var shop_id = $(this).closest('.wrapper').attr('id');
                            remove_shop(shop_id);
                        })
                    } , 10)
                }
                else{
                    $(document.body).append(((preferred_shops != 1) ? '<div id="nearby-shops" class="container nearby-shops">' : '<div id="preferred-shops" class="container preferred-shops">') + 
                    '<div class="container shops"><div class="row"><div class="col-md-6 col-md-offset-3 title"><h2>No Liked Shops Found</h2></div></div></div></div>');
                }
            },
            error: function(jqXHR, textStatus, errorThrown) { // What to do if we fail
                // console.log(JSON.stringify(jqXHR));
                console.log("AJAX error: " + textStatus + ' : ' + errorThrown);
            }
        });   
    }
    // #endregion
    
    //#region SECTION: Modal Settings
    $('#modal').on('click', function () {  
        $('#modal-container').addClass('hidden');
    })
    function modal_message( message){
        $('#modal-container').removeClass('hidden')
        $('#message').text(message)
    }
    //#endregion
})
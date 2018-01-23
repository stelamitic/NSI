var user;
var storage;
var coffee;
var size;
var price = 0;
var extras = new Array;
var orders = new Array;
var myMedia = null;

(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    document.addEventListener("backbutton", onBackKeyDown, false);

    function onBackKeyDown(e) {
        e.preventDefault();
        var prevPage;
        var currentPage = location.pathname.substring(1);
        switch (currentPage) {
            case "android_asset/www/index.html":
                prevPage = "index.html";
                break;
            case "android_asset/www/coffees.html":
                prevPage = "index.html";
                break;
            case "android_asset/www/coffeeDetails.html":
                prevPage = "coffees.html";
                break;
            case "android_asset/www/orderDetails.html":
                prevPage = "coffeeDetails.html";
                break;

        }
        var options = {
            "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
            "duration": 400, // in milliseconds (ms), default 400
            "slowdownfactor": 3, // overlap views (higher number is more) or no overlap (1).
                                //-1 doesn't slide at all. Default 4
            "slidePixels": 20, // optional, works nice with slowdownfactor -1 to create a 'material design'
                              //-like effect. Default not set so it slides the entire page.
            "iosdelay": 100, // ms to wait for the iOS webview to update before animation kicks in, default 60
            "androiddelay": 150, // same as above but for Android, default 70
            "winphonedelay": 250, // same as above but for Windows Phone, default 200,
            "fixedPixelsTop": 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
            "fixedPixelsBottom": 0,  // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
            "href": prevPage
        };
        window.plugins.nativepagetransitions.slide(
            options,
            function (msg) { console.log("success: " + msg) }, // called when the animation has finished
            function (msg) { alert("error: " + msg) } // called in case you pass in weird values
        );
    }

    function onDeviceReady() {

        if (document.getElementById("orderBtn") != null)
            document.getElementById("orderBtn").addEventListener('click', showOrderDetails);
        if (document.getElementById("cancelBtn") != null)
            document.getElementById("cancelBtn").addEventListener('click', cancelOrder);
        if (document.getElementById("callBtn") != null)
            document.getElementById("callBtn").addEventListener('click', makePhoneCall);
        if (document.getElementById("audioCaptureBtn") != null)
            document.getElementById("audioCaptureBtn").addEventListener("click", audioCapture);
        if (document.getElementById("uploadBtn") != null)
            document.getElementById("uploadBtn").addEventListener("click", cameraTakePicture);
        if (document.getElementById("videoBtn") != null)
            document.getElementById("videoBtn").addEventListener("click", playVideo);
        if (document.getElementById("confirmBtn") != null)
            document.getElementById("confirmBtn").addEventListener('click', confirmOrder);
        if (document.getElementById("signUpBtn") != null)
            document.getElementById("signUpBtn").addEventListener('click', signUp);
        if (document.getElementById("loginBtn") != null)
            document.getElementById("loginBtn").addEventListener('click', logIn);
        if (document.getElementById("renderHome") != null)
            document.getElementById("renderHome").addEventListener('click', showHome);
        if (document.getElementById("renderCoffees") != null)
            document.getElementById("renderCoffees").addEventListener('click', showCoffees);
        if (document.getElementById("startBtn") != null)
            document.getElementById("startBtn").addEventListener('click', showCoffees);
        if (document.getElementById("backBtn") != null)
            document.getElementById("backBtn").addEventListener('click', goBack);
        if (document.getElementById("espresso") != null)
            document.getElementById("espresso").addEventListener('click', showCoffeeDetails.bind(this, 'espresso'));
        if (document.getElementById("cappuccino") != null)
            document.getElementById("cappuccino").addEventListener('click', showCoffeeDetails.bind(this, 'cappuccino'));
        if (document.getElementById("macchiato") != null)
            document.getElementById("macchiato").addEventListener('click', showCoffeeDetails.bind(this, 'macchiato'));
        if (document.getElementById("caffeLatte") != null)
            document.getElementById("caffeLatte").addEventListener('click', showCoffeeDetails.bind(this, 'caffee latte'));
        if (document.getElementById("americano") != null)
            document.getElementById("americano").addEventListener('click', showCoffeeDetails.bind(this, 'americano'));
        if (document.getElementById("irishCoffee") != null)
            document.getElementById("irishCoffee").addEventListener('click', showCoffeeDetails.bind(this, 'irish coffee'));
        if (document.getElementById("mocha") != null)
            document.getElementById("mocha").addEventListener('click', showCoffeeDetails.bind(this, 'mocha'));
        if (document.getElementById("priceBtn") != null)
            document.getElementById("priceBtn").addEventListener('click', calculatePrice);

        if (document.getElementById("coffeeName") != null) {

            var usernameCoffee = Cookies.get('usernameCoffee');
            var splited = usernameCoffee.split(',');
            coffee = splited[1];
            document.getElementById("coffeeName").innerHTML = coffee;
            document.getElementById("small").innerHTML = " Small: " + getSmallPriceByName(coffee) + "$";
            document.getElementById("large").innerHTML = " Large: " + getLargePriceByName(coffee) + "$";
        }

        if (document.getElementById("size") != null)
            document.getElementById("size").addEventListener('change', calculatePrice());

        //extras
       if (document.getElementById("sugar") != null)
            document.getElementById("sugar").addEventListener('click', handleClick("sugar"));

       if (document.getElementById("coffeeOrder") != null) {

           var usernameOrder = Cookies.get('usernameOrder');
           var splited = usernameOrder.split(';');
           coffee = splited[1];
           size = splited[2];
           extras = splited[3];
           price = splited[4];

           document.getElementById("coffeeOrder").innerHTML = " Coffee: " + coffee;
           document.getElementById("sizeOrder").innerHTML = " Size: " + size;
           if (extras == "")
               document.getElementById("extrasOrder").innerHTML = " Extras: none";
           else
               document.getElementById("extrasOrder").innerHTML = " Extras: " + extras;
           document.getElementById("priceOrder").innerHTML = " Total price: " + (Number(price)).toFixed(1) + "$";

       }


    }

    function encodeQueryData(data) {
        let ret = [];
        for (let d in data)
            ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]));
        return ret.join('&');
    }

    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }


        var serializeObject = function (form) {
            var $form = $(form);
            var formObject = {};
            $form.serializeArray().forEach(function (el) {
                formObject[el.name] = el.value;
            });

            return formObject;
        }

        $(document).ready(function () {
            storage = window.localStorage;

            user = JSON.parse(Cookies.get('user'));
            if (user != null && user != undefined) {
                if (user.admin) {
                    $("a[href='#users']")
                        .css("display", 'inline');


                    refreshCoffeesId = setInterval('coffeesList(tags)', 1000);
                    refreshExtrasId = setInterval('extrasList()', 1000);
                    $("a[href='#addCoffeeForm']").css("display", "inline");
                    $("a[href='#addExtraForm']").css("display", "inline");
                }
                else {
                    $("a[href='#editProfileForm']")
                        .css("display", 'inline');
                }

                $("a[href='#loginForm']").removeClass("popup-with-form")
                    .addClass("logoutClass")
                    .html("Logout").attr("href", "#");

            }
            coffeesList(tags);
            extrasList();
            renderTags();

            refreshUsersId = setInterval('usersList()', 1000);
            refreshOrdersId = setInterval('ordersList()', 1000);
        });

    //SHOW PAGES

        function goBack()
        {
            var prevPage;
            var currentPage = location.pathname.substring(1);
            switch (currentPage) {
                case "android_asset/www/index.html":
                    prevPage = "index.html";
                    break;
                case "android_asset/www/coffees.html":
                    prevPage = "index.html";
                    break;
                case "android_asset/www/coffeeDetails.html":
                    prevPage = "coffees.html";
                    break;
                case "android_asset/www/orderDetails.html":
                    prevPage = "coffeeDetails.html";
                    break;

            }
            var options = {
                "direction": "right", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 400, // in milliseconds (ms), default 400
                "slowdownfactor": 3, // overlap views (higher number is more) or no overlap (1). -1 doesn't slide at all. Default 4
                "slidePixels": 20, // optional, works nice with slowdownfactor -1 to create a 'material design'-like effect. Default not set so it slides the entire page.
                "iosdelay": 100, // ms to wait for the iOS webview to update before animation kicks in, default 60
                "androiddelay": 150, // same as above but for Android, default 70
                "winphonedelay": 250, // same as above but for Windows Phone, default 200,
                "fixedPixelsTop": 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
                "fixedPixelsBottom": 0,  // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
                "href": prevPage
            };
            window.plugins.nativepagetransitions.slide(
                options,
                function (msg) { console.log("success: " + msg) }, // called when the animation has finished
                function (msg) { /*alert("error: " + msg)*/ } // called in case you pass in weird values
            );
           // window.location.replace(document.referrer);
        }

        function showHome() {
            var options = {
                "direction": "up", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 400, // in milliseconds (ms), default 400
                "slowdownfactor": 3, // overlap views (higher number is more) or no overlap (1). -1 doesn't slide at all. Default 4
                "slidePixels": 20, // optional, works nice with slowdownfactor -1 to create a 'material design'-like effect. Default not set so it slides the entire page.
                "iosdelay": 100, // ms to wait for the iOS webview to update before animation kicks in, default 60
                "androiddelay": 150, // same as above but for Android, default 70
                "winphonedelay": 250, // same as above but for Windows Phone, default 200,
                "fixedPixelsTop": 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
                "fixedPixelsBottom": 0,  // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
                "href": "index.html"
            };
            window.plugins.nativepagetransitions.slide(
                options,
                function (msg) { console.log("success: " + msg) }, // called when the animation has finished
                function (msg) {/* alert("error: " + msg) */} // called in case you pass in weird values
            );
            //window.location.replace("index.html");
        }

        function showCoffees()
        {
            var options = {
                "direction": "left", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 400, // in milliseconds (ms), default 400
                "slowdownfactor": 3, // overlap views (higher number is more) or no overlap (1). -1 doesn't slide at all. Default 4
                "slidePixels": 20, // optional, works nice with slowdownfactor -1 to create a 'material design'-like effect. Default not set so it slides the entire page.
                "iosdelay": 100, // ms to wait for the iOS webview to update before animation kicks in, default 60
                "androiddelay": 150, // same as above but for Android, default 70
                "winphonedelay": 250, // same as above but for Windows Phone, default 200,
                "fixedPixelsTop": 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
                "fixedPixelsBottom": 0,  // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
                "href": "coffees.html"
            };
            window.plugins.nativepagetransitions.slide(
                options,
                function (msg) { console.log("success: " + msg) }, // called when the animation has finished
                function (msg) { /*alert("error: " + msg)*/ } // called in case you pass in weird values
            );
            //window.location.replace("coffees.html");
        }     

        var showCoffeeDetails = function (coffee) {
            //var data = { 'coffee': coffee };
            //var querystring = encodeQueryData(data);
            //var url = "http://localhost:4400/coffeeDetails.html?";
            //var concatenated = url.concat(querystring);
            //window.location.replace(concatenated);
            var username = Cookies.get('user');
            Cookies.set('usernameCoffee', username + "," + coffee);
            var options = {
                "direction": "left", // 'left|right|up|down', default 'left' (which is like 'next')
                "duration": 400, // in milliseconds (ms), default 400
                "slowdownfactor": 3, // overlap views (higher number is more) or no overlap (1). -1 doesn't slide at all. Default 4
                "slidePixels": 20, // optional, works nice with slowdownfactor -1 to create a 'material design'-like effect. Default not set so it slides the entire page.
                "iosdelay": 100, // ms to wait for the iOS webview to update before animation kicks in, default 60
                "androiddelay": 150, // same as above but for Android, default 70
                "winphonedelay": 250, // same as above but for Windows Phone, default 200,
                "fixedPixelsTop": 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
                "fixedPixelsBottom": 0,  // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
                "href": "coffeeDetails.html"
            };
            window.plugins.nativepagetransitions.slide(
                options,
                function (msg) { console.log("success: " + msg) }, // called when the animation has finished
                function (msg) { /*alert("error: " + msg)*/ } // called in case you pass in weird values
            );
            //window.location.replace('coffeeDetails.html');
        };

        function showOrderDetails() {
                calculatePrice();
                //var data = { 'coffee': coffee, 'size': size, 'extras': extras, 'price': price };
                //var querystring = encodeQueryData(data);
                //var url = "http://localhost:4400/orderDetails.html?";
                //var concatenated = url.concat(querystring);
                //window.location.replace(concatenated);
                var username = Cookies.get('user');
                Cookies.set('usernameOrder', username + ";" + coffee + ";" + size + ";" + extras + ";" + price);
                //window.location.replace('orderDetails.html');
                var options = {
                    "direction": "left", // 'left|right|up|down', default 'left' (which is like 'next')
                    "duration": 400, // in milliseconds (ms), default 400
                    "slowdownfactor": 3, // overlap views (higher number is more) or no overlap (1). -1 doesn't slide at all. Default 4
                    "slidePixels": 20, // optional, works nice with slowdownfactor -1 to create a 'material design'-like effect. Default not set so it slides the entire page.
                    "iosdelay": 100, // ms to wait for the iOS webview to update before animation kicks in, default 60
                    "androiddelay": 150, // same as above but for Android, default 70
                    "winphonedelay": 250, // same as above but for Windows Phone, default 200,
                    "fixedPixelsTop": 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
                    "fixedPixelsBottom": 0,  // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
                    "href": "orderDetails.html"
                };
                window.plugins.nativepagetransitions.slide(
                    options,
                    function (msg) { console.log("success: " + msg) }, // called when the animation has finished
                    function (msg) { /*alert("error: " + msg)*/ } // called in case you pass in weird values
                );
            }

        //function addMoreCoffees() {
        //    //var data = { 'coffee': coffee, 'size': size, 'extras': extras, 'price': price };
        //    //var querystring = encodeQueryData(data);
        //    //var url = "http://localhost:4400/coffees.html?";
        //    //var concatenated = url.concat(querystring);
        //    //window.location.replace(concatenated);
        //    var username = Cookies.get('user');
        //    Cookies.set('usernameOrder', username + ";" + coffee + ";" + size + ";" + extras + ";" + price);
        //    window.location.replace('coffees.html');

        //}

        function confirmOrder()
        {
            //Email.send("stela.mitic@gmail.com",
            //    "stela.mitic@elfak.rs",
            //    "Order",
            //    "COFFEE: " + coffee + ", SIZE: " + size + ", EXTRAS: " + extras + ", PRICE: " + price,
            //    "smtp.elasticemail.com",
            //    "stela.mitic@gmail.com",
            //    "f58a7e7a- 5cd5- 4d51- 946a- e5f0ff7b1361");
            //var subject = "Order";
            var body = "COFFEE: " + coffee + ", SIZE: " + size + ", EXTRAS: " + extras + ", PRICE: " + price;
            //window.open('mailto:stela.mitic@gmail.com?subject=subject&body=body');
            var message = "You have successfully ordered.";
            var title = "Info";
            var buttonName = "OK";
            navigator.notification.alert(message, alertCallback, title, buttonName);
            function alertCallback() {
                console.log("Alert is Dismissed!");
            }
        }

    //USER
    function signUp() {
            var username = $("#signUpForm input[name='username']").val();
            var password = $("#signUpForm input[name='password']").val();

            var email = $("#signUpForm input[name='email']").val();

            if (username == "" || password == "" || email == "") {
               // alert("You must fill all fields!");
                var message = "You must fill all fields!";
                var title = "Alert";
                var buttonName = "OK";
                navigator.notification.alert(message, alertCallback, title, buttonName);
                function alertCallback() {
                    console.log("Alert is Dismissed!");
                }
                return;
            }

            var newUser = "{username:\"" + username
                + "\",password:\"" + password
                + "\", email:\"" + email + "\"}";

            if (storage.getItem(username) != null)
            {
                //alert("Username already exists.");
                var message = "Username already exists.";
                var title = "Alert";
                var buttonName = "OK";
                navigator.notification.alert(message, alertCallback, title, buttonName);
                function alertCallback() {
                    console.log("Alert is Dismissed!");
                }
           }
    
            else {
                storage.setItem(username, password);
                storage.setItem(username, email);
            }

            var message = "Successfully signed up.";
            var title = "Info";
            var buttonName = "OK";
            navigator.notification.alert(message, alertCallback, title, buttonName);
            function alertCallback() {
                console.log("Alert is Dismissed!");
            }

            $.magnificPopup.close();
        }

    function logIn() {
        var username = $("#loginForm input[name='username']").val();
        var password = $("#loginForm input[name='password']").val();

        if (username == "" || password == "") {
            //alert("You must fill all fields!");
            var message = "You must fill all fields!";
            var title = "Alert";
            var buttonName = "OK";
            navigator.notification.alert(message, alertCallback, title, buttonName);
            function alertCallback() {
                console.log("Alert is Dismissed!");
            }
            return;
        }

        if (storage.getItem(username) == null)
        {
            var message = "Invalid username or password.";
            var title = "Alert";
            var buttonName = "OK";
            navigator.notification.alert(message, alertCallback, title, buttonName);
            function alertCallback() {
                console.log("Alert is Dismissed!");
            }
        }
            //alert("Invalid username or password.");
        else {
            var message = "Successfully logged in.";
            var title = "Info";
            var buttonName = "OK";
            navigator.notification.alert(message, alertCallback, title, buttonName);
            function alertCallback() {
                console.log("Alert is Dismissed!");
                transition();
            }
            function transition() {
                var duration = 0.5, // animation time in seconds
                    direction = "right"; // animation direction - left | right | top | bottom
                nativetransitions.flip(duration, direction, onComplete);
                function onComplete() {
                    console.log("completed.");
                }
            }
            $.magnificPopup.close();
            $("#loginForm input[name='username']").val("");
            $("#loginForm input[name='password']").val("");
            Cookies.set('user', username);
            $("a[href='#loginForm']").removeClass("popup-with-form")
                .addClass("logoutClass")
                .html("Logout").attr("href", "#");

        }

    }

    function logout(el) {

        //$("#orderBtn").css('display', 'none');
        //$("#renderOrders").html("");

        //if (user.admin) {
        //    $("#renderUsers").html("");
        //    $("#renderCoffees").html("");
        //    $('a[href="#addCoffeeForm"]').hide();
        //    $('a[href="#addExtraForm"]').hide();

        //    $("a[href='#users']").css("display", 'none');
        //}

        //$("a[href='#editProfileForm']").css("display", 'none');
        Cookies.set('user', null);
        Cookies.set('usernameOrder', null);
        Cookies.set('usernameCoffee', null);

        //coffeesList(tags);
        //extrasList();
        //clearInterval(refreshCoffeesId);
        //clearInterval(refreshExtrasId);
        //alert("You are logged out.");
        var message = "You are logged out.";
        var title = "Info";
        var buttonName = "OK";
        navigator.notification.alert(message, alertCallback, title, buttonName);
        function alertCallback() {
            console.log("Alert is Dismissed!");
        }
        $.magnificPopup.close();

        $(el).html("Login").attr("href", "#loginForm")
            .addClass("popup-with-form")
            .removeClass("logoutClass");

    }

    //coffeeDetails

    function getSmallPriceByName(name) {
        var price;

        switch (name) {
            case "espresso":
                price = "1.5";
                break;
            case "cappuccino":
                price = "1.7";
                break;
            case "macchiato":
                price = "1.7";
                break;
            case "caffee latte":
                price = "1.9";
                break;
            case "americano":
                price = "1.8";
                break;
            case "irish coffee":
                price = "2";
                break;
            case "mocha":
                price = "2";
                break;
            default:
                price = "0";
        }

        return price;
    }

    function getLargePriceByName(name) {
        var price;

        switch (name) {
            case "espresso":
                price = "2";
                break;
            case "cappuccino":
                price = "2.2";
                break;
            case "macchiato":
                price = "2.2";
                break;
            case "caffee latte":
                price = "2.4";
                break;
            case "americano":
                price = "2.3";
                break;
            case "irish coffee":
                price = "2.5";
                break;
            case "mocha":
                price = "2.5";
                break;
            default:
                price = "0";
        }

        return price;
    }

    function getExtrasPriceByName(name) {
        var price;

        switch (name) {
            case "sugar":
                price = "0.2";
                break;
            case "cinnamon":
                price = "0.3";
                break;
            case "rum":
                price = "0.4";
                break;
            case "vanilla":
                price = "0.3";
                break;
            case "icecream":
                price = "0.4";
                break;
            default:
                price = "0";
        }

        return price;
    }

    function handleClick(id) {
        var cb = document.getElementById(id);
        console.log("Clicked, value = " + cb.checked);
        
    }

    function calculatePrice() {
        price = 0;
        var radios = document.getElementsByName('size');

        if (radios[0].checked) {
            price += Number(getSmallPriceByName(coffee));
            size = "small";
        }
        else {
            price += Number(getLargePriceByName(coffee));
            size = "large";
        }
        getExtrasPrice();
    }

    function getExtrasPrice() {

        var chkArray = [];
        var checked;
        /* look for all checkboes that have a class 'chk' attached to it and check if it was checked */
        $(".chk:checked").each(function () {
            checked = $(this).val();
            chkArray.push(checked);
            price += Number(getExtrasPriceByName(checked));
        });

        extras = chkArray.join(',');;
        console.log("You have selected " + extras);
    }

    function makePhoneCall() {

        var number = "+381648535774";
        window.plugins.CallNumber.callNumber(onSuccess, onError, number, false);
        function onSuccess(result) {
            console.log("Success:" + result);
        }

        function onError(result) {
            console.log("Error:" + result);
        }
    }

    //function audioCapture() {
    //    var src = "myrecording.mp3";
    //    var mediaRec = new Media(src, onSuccess, onError);

    //    // Record audio
    //    mediaRec.startRecord();

    //    // Stop recording after 10 sec
    //    var recTime = 0;
    //    var recInterval = setInterval(function () {
    //        recTime = recTime + 1;
    //        setAudioPosition(recTime + " sec");
    //        if (recTime >= 10) {
    //            clearInterval(recInterval);
    //            mediaRec.stopRecord();
    //        }
    //    }, 1000);
    //}
    //function onSuccess() {
    //   alert("recordAudio():Audio Success");
    //}

    //// onError Callback 
    ////
    //function onError(error) {
    //    alert('code: ' + error.code + '\n' +
    //        'message: ' + error.message + '\n');
    //}

    function audioCapture()
    {
        var options = {
            limit: 1,
            duration: 10
        };
        navigator.device.capture.captureAudio(onSuccess, onError, options);

        function onSuccess(mediaFiles) {
            var i, path, len;
            for (i = 0, len = mediaFiles.length; i < len; i += 1) {
                myMedia = mediaFiles[i].fullPath;
                uploadFile(myMedia);
            }
        }

        function onError(error) {
            navigator.notification.alert('Error code: ' + error.code, null, 'Capture Error');
        }
    }

    function uploadFile(myMedia) {
        var fileURL = myMedia;
        var uri = encodeURI("http://posttestserver.com/post.php");

        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = fileURL.substr(fileURL.lastIndexOf('/') + 1);
        options.mimeType = "text/plain";
        var headers = { 'headerParam': 'headerValue' };
        options.headers = headers;

        var ft = new FileTransfer();
        ft.upload(fileURL, uri, onSuccess, onError, options);

        function onSuccess(r) {
            var message = "Your audio message is successfully uploaded.";
            var title = "Info";
            var buttonName = "OK";
            navigator.notification.alert(message, alertCallback, title, buttonName);
            function alertCallback() {
                console.log("Alert is Dismissed!");
            }
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
        }

        function onError(error) {
            alert("An error has occurred. Please try again later.");
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
        }

    }

    function playVideo()
    {
        YoutubeVideoPlayer.openVideo('RElgiE8_Y0Y', function (result)
            { console.log('YoutubeVideoPlayer result = ' + result); });
    }

    function cameraTakePicture() {
        navigator.camera.getPicture(onSuccess, onFail, {
            quality: 10,
            destinationType: Camera.DestinationType.FILE_URI
        });

        function onSuccess(imageURI) {
            //alert(imageURI);
            //window.resolveLocalFileSystemURL(imageURI, function success(fileEntry) {

            //    // Do something with the FileEntry object, like write to it, upload it, etc.
            //    // writeFile(fileEntry, imgUri);
            //    alert("got file: " + fileEntry);
            //    // displayFileData(fileEntry.nativeURL, "Native URL");

            //}, function () {
            //    // If don't get the FileEntry (which may happen when testing
            //    // on some emulators), copy to a new FileEntry.
            //    alert("Didn't make it.");
            //});
            uploadPhoto(imageURI);
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }
    }

    function uploadPhoto(image)
    {
            var fileURI = image;
            var uri = encodeURI("http://posttestserver.com/post.php");
            var options = new FileUploadOptions();
            options.fileKey = "file";
            options.fileName = fileURI.substr(fileURI.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";

            var ft = new FileTransfer();
            ft.upload(fileURI, uri, onSuccess, onError, options);

            function onSuccess(r) {
                var message = "Your photo is successfully uploaded.";
                var title = "Info";
                var buttonName = "OK";
                navigator.notification.alert(message, alertCallback, title, buttonName);
                function alertCallback() {
                    console.log("Alert is Dismissed!");
                }
                console.log("Code = " + r.responseCode);
                console.log("Response = " + r.response);
                console.log("Sent = " + r.bytesSent);
            }
            function onError(error) {
                alert("An error has occurred. Please try again later.");
                console.log("upload error source " + error.source);
                console.log("upload error target " + error.target);
            }
    }

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
})();



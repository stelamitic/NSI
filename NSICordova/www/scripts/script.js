var user = null;
var storage;
var coffee = null;
var price = 0;
var extras = new Array;
var tags = new Array;

var usersTemplate;
var coffeesTemplate;
var extrasTemplate;
var ordersTemplate;
var tagsTemplate;

var refreshUsersId;
var refreshCoffeesId;
var refreshExtrasId;
var refreshTagsId;

(function () {
    "use strict";

    document.addEventListener('deviceready', onDeviceReady.bind(this), false);

    function onDeviceReady() {

        document.getElementById("signUpBtn").addEventListener('click', signUp);
        document.getElementById("loginBtn").addEventListener('click', logIn);

     
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

        //USER

        function signUp()
        {
            var username = $("#signUpForm input[name='username']").val();
            var password = $("#signUpForm input[name='password']").val();

            var email = $("#signUpForm input[name='email']").val();

            if (username == "" || password == "" || email == "") {
                alert("You must fill all fields!");
                return;
            }

            var newUser = "{username:\"" + username
                + "\",password:\"" + password
                + "\", email:\"" + email + "\"}";

            if (storage.getItem(username) != null)
                alert("Username already exists.");
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

       

        $("#editProfileBtn").click(function () {

            var username = $("#editProfileForm input[name='username']").val();
            var password = $("#editProfileForm input[name='password']").val();

            var fullName = $("#editProfileForm input[name='fullName']").val();
            var email = $("#editProfileForm input[name='email']").val();

            var newUser = "{username:\"" + username
                + "\",password:\"" + password
                + "\", fullName:\"" + fullName + "\", email:\"" + email + "\"}";

            $.ajax({
                type: "POST",
                url: "/api/User/update",
                contentType: "application/json",
                data: newUser
            }).success(function () {
                alert("Successfully updated.");
                $.magnificPopup.close();

                $("#editProfileForm input[name='username']").val("");
                $("#editProfileForm input[name='password']").val("");
                $("#editProfileForm input[name='fullName']").val("");
                $("#editProfileForm input[name='email']").val("");
                user.username = username;
                user.password = password;
                user.email = email;
                user.fullName = fullName;

            }).fail(function () {
                alert("Error connecting to server!");
            });
        });

        editProfile = function () {
            $("#editProfileForm input[name='username']").val(user.username);
            $("#editProfileForm input[name='password']").val(user.password);
            $("#editProfileForm input[name='fullName']").val(user.fullName);
            $("#editProfileForm input[name='email']").val(user.email);
        }

        //ADMIN

        /////////////////////////////users 


        var renderUsers = function (data) {

            var templateData = [];

            var rowLength = 4;
            var currentIndex = 0;

            while (currentIndex <= users.length - 1) {
                templateData.push(users.slice(currentIndex, currentIndex + rowLength));
                currentIndex += rowLength;
            }

            var tmpData = {
                users: data
            };

            $("#renderUsers").html(usersTemplate(tmpData));
        }

        usersList = function () {
            if (user != null && user.admin == true) {
                var source = $("#usersTemplate").html();
                usersTemplate = Handlebars.compile(source);

                $.ajax({
                    async: true,
                    type: "GET",
                    url: "/api/User/getAll",
                })
                    .success(function (data) {
                        var users = data;
                        renderUsers(users);
                    })
                    .fail(function () {
                        alert("Error connecting to server.");
                    });
            }
            else return;
        }

        function deleteUser(userToDelete) {
            $.getJSON("/api/User/delete/" + userToDelete).done(function () {
                alert("Successfully deleted user.");
            })
                .fail(function () {
                    alert("Error connecting to server.");
                });
        }

        /////////////////////////////coffees

        coffeesList = function (tags) {
            var source = $("#coffeesTemplate").html();
            coffeesTemplate = Handlebars.compile(source);
            if (tags != undefined && tags.length == 0) {

                $.ajax({
                    async: true,
                    type: "GET",
                    url: "/api/coffee/getAll",
                    contentType: "application/json",
                    data: tags
                })
                    .success(function (data) {
                        var coffees = data;
                        renderCoffees(coffees);
                    })
                    .fail(function () {
                        alert("Error connecting to server.");
                    });
            }
            else {
                $.ajax({
                    async: true,
                    type: "POST",
                    url: "/api/coffee/getTaggedCoffees",
                    contentType: "application/json",
                    data: JSON.stringify({ "tags": tags })
                })
                    .success(function (data) {
                        var coffees = data;
                        renderCoffees(coffees);
                    })
                    .fail(function () {
                        alert("Error connecting to server.");
                    });

            }
        }

        var renderCoffees = function (data) {
            var admin;

            if (user == null)
                context = {
                    admin: false,
                    coffees: data
                };
            else
                context = {
                    admin: user.admin,
                    coffees: data
                };

            $("#renderCoffees").html(coffeesTemplate(context));
        }

        $("#addCoffeeBtn").click(function () {
            window.clearInterval(refreshCoffeesId);

            var imageName = $("#addCoffeeForm input[name='imageName']").val();
            if (imageName != "")
                uploadImage("coffee");
            var type = $("#addCoffeeForm input[name='type']").val();
            var small = $("#addCoffeeForm input[name='small']").val();
            var medium = $("#addCoffeeForm input[name='medium']").val();
            var large = $("#addCoffeeForm input[name='large']").val();

            if (imageName == "" || type == "" || small == "" || medium == "" || large == "") {
                alert("You must fill all field!");
                return;
            }

            var newCoffee = "{image:\"" + imageName
                + "\",type:\"" + type
                + "\",  small:\"" + small + "\", medium:\"" + medium + "\", large:\"" + large + "\"}";

            $.ajax({
                type: "POST",
                url: "/api/Coffee/add",
                contentType: "application/json",
                data: newCoffee
            }).success(function (data) {
                var res;
                if (data == true) {
                    alert("Successfully added new coffee.");
                    refreshCoffeesId = window.setInterval('coffeesList(tags)', 1000);

                    $.magnificPopup.close();
                    $("#addCoffeeForm input[name='image']").val("");
                    $("#addCoffeeForm input[name='imageName']").val("");
                    $("#addCoffeeForm input[name='type']").val("");
                    $("#addCoffeeForm input[name='small']").val("");
                    $("#addCoffeeForm input[name='medium']").val("");
                    $("#addCoffeeForm input[name='large']").val("");
                }
                else
                    res = "Coffee already exists!";

                alert(res);

            })
                .fail(function () {
                    alert("Error connecting to the server.");
                });

        });

        function uploadImage(imageType) {
            var file = $(".image." + imageType).get(0).files;
            if (file.length == 1) {
                var data = new FormData();
                data.append("image", file[0]);
                $.ajax({
                    type: "POST",
                    url: "api/coffee/uploadImage/" + imageType,
                    contentType: false,
                    processData: false,
                    data: data,
                    success: function (message) {
                        alert(message);
                    },
                    error: function () {
                        alert("Error connecting to server.");
                    }
                });
            } else {
                return;
            }
        };

        $("input.image").change(function () { //image prilikom dodavanja nove kafe
            var file = $(this)[0].files[0];
            if (file != null)
                $("#addCoffeeForm input[name='imageName']").val(file.name);
            else
                $("#addCoffeeForm input[name='imageName']").val("");
        });

        function changeImageName() { //ovo ne radi :)
            var coffeeName = $("input.newImage").data("oldName");
            var file = $(this)[0].files[0];
            if (file != null)
                $("#newImageName" + oldName).val(file.name);
            else
                $("#newImageName" + oldName).val("");
        }

        $(document).on('change', 'input.newImage', function () {
            changeImageName();
            //alert('Change Happened');
        });

        function deleteCoffee(coffeeToDelete) {
            $.getJSON("/api/Coffee/delete/" + coffeeToDelete).done(function () {
                alert("Successfully deleted coffee.");
                renderCoffees();
            })
                .fail(function () {
                    alert("Error connecting to server.");
                });
        }

        function editCoffee(oldName) {
            window.clearInterval(refreshCoffeesId);
            $("#saveChanges" + oldName).css("display", 'inline');
            $("#newType" + oldName).removeAttr('disabled');
            $("#smallSize" + oldName).removeAttr('disabled');
            $("#mediumSize" + oldName).removeAttr('disabled');
            $("#largeSize" + oldName).removeAttr('disabled');
            $("#changeCoffeeImageDiv" + oldName).css("display", 'inline');
        }

        function updateCoffee(oldName) {
            var newImageName = $("#newImageName" + oldName).val();
            if (newImageName != "")
                uploadImage("coffee");
            var type = $("#newType" + oldName).val();
            var small = $("#smallSize" + oldName).val();
            var medium = $("#mediumSize" + oldName).val();
            var large = $("#largeSize" + oldName).val();

            var newCoffee = "{image:\"" + newImageName
                + "\",type:\"" + type
                + "\",  small:\"" + small + "\", medium:\"" + medium + "\", large:\"" + large + "\"}";

            $.ajax({
                type: "POST",
                url: "/api/Coffee/update/" + oldName,
                contentType: "application/json",
                data: newCoffee
            }).success(function () {
                alert("Successfully updated.");
                refreshCoffeesId = setInterval('coffeesList(tags)', 1000);
                $("#saveChanges" + oldName).css("display", 'none');
                $("#changeCoffeeImageDiv" + oldName).css("display", 'none');


            }).fail(function () {
                alert("Error connecting to server!");
            });
        }


        ////////////////////////////////extras

        function extrasList() {
            var source = $("#extrasTemplate").html();
            extrasTemplate = Handlebars.compile(source);

            $.ajax({
                async: true,
                type: "GET",
                url: "/api/extra/getAll",
            })
                .success(function (data) {
                    var extras = data;
                    renderExtras(extras);
                })
                .fail(function () {
                    alert("Error connecting to server.");
                });
        }


        var renderExtras = function (data) {
            var admin;

            if (user == null)
                context = {
                    admin: false,
                    extras: data
                };
            else
                context = {
                    admin: user.admin,
                    extras: data
                };

            $("#renderExtras").html(extrasTemplate(context));
        }

        $("#addExtraBtn").click(function () {
            window.clearInterval(refreshCoffeesId);

            var imageName = $("#addExtraForm input[name='imageName']").val();
            if (imageName != "")
                uploadImage("extra");
            var type = $("#addExtraForm input[name='type']").val();
            var price = $("#addExtraForm input[name='price']").val();

            if (imageName == "" || type == "" || price == "") {
                alert("You must fill all field!");
                return;
            }

            var newExtra = "{image:\"" + imageName
                + "\",type:\"" + type
                + "\", price:\"" + price + "\"}";

            $.ajax({
                type: "POST",
                url: "/api/Extra/add",
                contentType: "application/json",
                data: newExtra
            }).success(function (data) {
                var res;
                if (data == true) {
                    alert("Successfully added new extra.");
                    refreshExtrasId = window.setInterval('extrasList()', 1000);

                    $.magnificPopup.close();
                    $("#addExtraForm input[name='image']").val("");
                    $("#addExtraForm input[name='imageName']").val("");
                    $("#addExtraForm input[name='type']").val("");
                    $("#addExtraForm input[name='price']").val("");
                }
                else
                    res = "Extra already exists!";

                alert(res);
            })
                .fail(function () {
                    alert("Error connecting to the server.");
                });

        });

        $("#addExtraForm input[name='image']").change(function () {
            var file = $("#addExtraForm input[name='image']")[0].files[0];
            if (file != null)
                $("#addExtraForm input[name='imageName']").val(file.name);
            else
                $("#addExtraForm input[name='imageName']").val("");
        });

        function editExtra(oldName) {
            window.clearInterval(refreshExtrasId);
            $("#saveChanges" + oldName).css("display", 'inline');
            $("#newType" + oldName).removeAttr('disabled');
            $("#newPrice" + oldName).removeAttr('disabled');
            $("#changeExtraImageDiv" + oldName).css("display", 'inline');
        }

        function updateExtra(oldName) {
            var newImageName = $("#newImageName" + oldName).val();
            if (newImageName != "")
                uploadImage("extra");
            var type = $("#newType" + oldName).val();
            var price = $("#newPrice" + oldName).val();

            var newExtra = "{image:\"" + newImageName
                + "\",type:\"" + type
                + "\", price:\"" + price + "\"}";

            $.ajax({
                type: "POST",
                url: "/api/Extra/update/" + oldName,
                contentType: "application/json",
                data: newExtra
            }).success(function () {
                alert("Successfully updated.");
                refreshExtrasId = setInterval('extrasList()', 1000);
                $("#saveChanges" + oldName).css("display", 'none');

            }).fail(function () {
                alert("Error connecting to server!");
            });
        }

        function deleteExtra(extraToDelete) {
            $.getJSON("/api/Extra/delete/" + extraToDelete).done(function () {
                alert("Successfully deleted extra.");
                renderExtras();
            })
                .fail(function () {
                    alert("Error connecting to server.");
                });
        }

        ////////////////////////////////order


        function goToExtras(coffeeType) {
            coffee = coffeeType;
            var priceSize = parseInt($("input[name='size" + coffeeType + "']:checked").val());

            price = price + priceSize;

            $("#orderBtn").css('display', 'block');
        }

        function order() {
            if (user == null) {
                alert("You must login first!");
                return;
            }
            if (coffee == null) {

                alert("You must choose coffee first!");
                return;
            }
            $("input[name='extra']:checked").each(function () {
                price = price + $(this).data('price');
                extras.push($(this).val());
            });

            var newOrder = "{user:\"" + user.username
                + "\",coffee:\"" + coffee
                + "\",price:\"" + price
                + "\", extras:\"" + extras + "\"}";

            $.ajax({
                type: "POST",
                url: "/api/Order/add",
                contentType: "application/json",
                data: newOrder
            }).success(function () {
                alert("You have successfully ordered coffee.");
                extras = new Array;
                price = 0;
                coffee = null;
            }).fail(function () {
                alert("Error connecting to server!");
            });
        }

        function ordersList() {
            if (user == null)
                return;
            if (user.admin == true) {
                var source = $("#ordersTemplate").html();
                ordersTemplate = Handlebars.compile(source);

                $.ajax({
                    async: true,
                    type: "GET",
                    url: "/api/order/getAll",
                })
                    .success(function (data) {
                        var orders = data;
                        renderOrders(orders, true);
                    })
                    .fail(function () {
                        alert("Error connecting to server.");
                    });
            }
            else {
                var source = $("#ordersTemplate").html();
                ordersTemplate = Handlebars.compile(source);

                $.ajax({
                    async: true,
                    type: "GET",
                    url: "/api/order/getUserOrders/" + user.username,
                })
                    .success(function (data) {
                        var orders = data;
                        renderOrders(orders, false);
                    })
                    .fail(function () {
                        alert("Error connecting to server.");
                    });
            };

        }

        var renderOrders = function (data, isAdmin) {

            var templateData = [];

            var rowLength = 4;
            var currentIndex = 0;

            while (currentIndex <= orders.length - 1) {
                templateData.push(orders.slice(currentIndex, currentIndex + rowLength));
                currentIndex += rowLength;
            }

            var tmpData = {
                orders: data,
                admin: isAdmin
            };

            $("#renderOrders").html(ordersTemplate(tmpData));
        }

        function deleteOrder(orderToDelete) {
            $.getJSON("/api/Order/delete/" + orderToDelete).done(function () {
                alert("Successfully deleted order.");
            })
                .fail(function () {
                    alert("Error connecting to server.");
                });
        }

        //tags

        function addNewTag(coffeeType) {
            var tag = $("input[name='tag'][data-coffee='" + coffeeType + "']").val();
            var toSend = "{newTag:\"" + tag + "\"}";

            $.ajax(
                {
                    type: "POST",
                    url: "/api/Coffee/addTag/" + coffeeType,
                    contentType: "application/json",
                    data: toSend,
                }).success(function () {
                    coffeesList(tags);
                    renderTags();
                });
        }

        function deleteTag(coffee, tag) {
            var toSend = "{tagToDel:\"" + tag + "\"}";

            $.ajax(
                {
                    type: "POST",
                    url: "/api/Coffee/deleteTag/" + coffee,
                    contentType: "application/json",
                    data: toSend,
                }).success(function () {
                    coffeesList(tags);
                    renderTags();
                });
        }

        function concatTag(tag, el) {

            $(el).toggleClass('activeTag');

            if ($.inArray(tag, tags) != -1) {
                tags.splice($.inArray(tag, tags), 1);
            }
            else
                tags.push(tag);

            coffeesList(tags);
        }

        function renderTags() {
            var source = $("#tagsTemplate").html();
            tagsTemplate = Handlebars.compile(source);

            $.ajax(
                {
                    async: true,
                    type: "GET",
                    url: "/api/coffee/getTags",
                }).success(function (data) {
                    var context = { tags: data };
                    $("#renderTags").html(tagsTemplate(context));
                });
        }
    };

    function logIn() {
        var username = $("#loginForm input[name='username']").val();
        var password = $("#loginForm input[name='password']").val();

        if (username == "" || password == "") {
            alert("You must fill all field!");
            return;
        }

        if (storage.getItem(username) == null)
            alert("Invalid username or password.");
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
        user = null;
        Cookies.set('user', user);

        //coffeesList(tags);
        //extrasList();
        //clearInterval(refreshCoffeesId);
        //clearInterval(refreshExtrasId);
        alert("You are logged out.");
        $.magnificPopup.close();

        $(el).html("Login").attr("href", "#loginForm")
            .addClass("popup-with-form")
            .removeClass("logoutClass");

    }

    function onPause() {
        // TODO: This application has been suspended. Save application state here.
    };

    function onResume() {
        // TODO: This application has been reactivated. Restore application state here.
    };
})();



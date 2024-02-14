// function Tank (weight) {
//     this.weight = weight;
// }

// Tank.prototype.fire = function () {
//     console.log("BOOOOOOOOMMMMM");
// }

// var myTank = new Tank(78);
// console.log(myTank);
// myTank.fire();

// var newTank = {
//     weight: 53,

//     getWeight: function () {
//         var self = this;
//         var increaseWeight = function () {
//             self.weight = 105;
//         };
//         increaseWeight();
//         console.log(this.weight);
//     }
// }

// newTank.getWeight();

$(function() { // Same as document.addEventListener("DOMContentLoaded"...)

    // Same as document.querySelector("#navbarToggler").addEventListener("blur")
    $("#navbarToggler").blur(function(event) {
        var screenWidth = window.innerWidth;
        if (screenWidth < 768) {
            $("#collapsible-nav").collapse('hide');
        }
    })
});

(function (global) {
    var dc = {};

    var homeHtml = "snippets/home-snippet.html";
    var allCategoriesUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/categories.json";
    var categoriesTitleHtml = "snippets/categories-title-snippet.html";
    var categoryHtml = "snippets/category-snippet.html";
    var menuItemsUrl = "https://coursera-jhu-default-rtdb.firebaseio.com/menu_items/";
    var menuItemsTitleHtml = "snippets/menu-items-title.html";
    var menuItemHtml = "snippets/menu-item.html";

    // Convinience function for inserting innerHTML for 'select'
    var insertHtml = function(selector, html) {
        var targetElem = document.querySelector(selector);
        targetElem.innerHTML = html;
    };

    // Show loading icon inside element identified by 'selector'
    var showLoading = function(selector) {
        var html = "<div class='text-center'>";
        html += "<img src='images/ajax-loader.gif'></div>";
        insertHtml(selector, html);
    };

    // Return substitute of '{{propName}}' with propValue in given 'string'
    var insertProperty = function(string, propName, propValue) {
        var propToReplace = "{{" + propName + "}}";
        string = string.replace(new RegExp(propToReplace, "g"), propValue);
        return string;
    };

    // Remove the class 'active' from home and switch to Menu button
    var switchMenuToActive = function() {
        // Remove 'active' from home button
        var classes = document.querySelector("#navHomeButton").className;
        classes = classes.replace(new RegExp("active", "g"), "");
        document.querySelector("#navHomeButton").className = classes;

        //Add 'active' to menu button if not already there
        classes = document.querySelector("#navMenuButton").className;
        if (classes.indexOf("active") == -1) {
            classes += " active";
            document.querySelector("#navMenuButton").className = classes;
        }
    }

    // On page load (bejore images or CSS)
    document.addEventListener("DOMContentLoaded", function(event) {

        // On first load, show home view
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(homeHtml, function(request) {
            document.querySelector("#main-content").innerHTML = request.responseText;
        },
        false);
    });

    dc.loadMenuCategories = function() {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(allCategoriesUrl, buildAndShowCategoriesHTML);
        switchMenuToActive();
    };

    function buildAndShowCategoriesHTML(categories) {
        // Load title snippet of categories page
        $ajaxUtils.sendGetRequest(categoriesTitleHtml, function(titleRequest) {
            // Retrieve single category snippet
            $ajaxUtils.sendGetRequest(categoryHtml, function(categoryRequest) {
                var categoriesViewHtml = buildCategoriesViewHtml(categories, titleRequest, categoryRequest);
                insertHtml("#main-content", categoriesViewHtml);
            }, false);
        },
        false);
    }


    // Using categories daata and snippets html build categories view HTML to be inserted into page
    function buildCategoriesViewHtml(categories, titleRequest, categoryRequest) {
        var finalHtml = titleRequest.responseText;
        finalHtml += "<section class='row'>";

        // Loop over categories
        for (var i=0; i<categories.length; i++) {
            var html = categoryRequest.responseText;
            var name = categories[i].name;
            var short_name = categories[i].short_name;
            html = insertProperty(html, "name", name);
            html = insertProperty(html, "short_name", short_name);
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    //Load the menu items view. categoryShort is short_name of category
    dc.loadMenuItems = function(categoryShort) {
        showLoading("#main-content");
        $ajaxUtils.sendGetRequest(menuItemsUrl + categoryShort + ".json", buildAndShowMenuItemsHTML);
    }

    // Builds HTML for the single category page based on the data from the server
    function buildAndShowMenuItemsHTML(categoryMenuItems) {
        //Load title snippet of menu items page
        $ajaxUtils.sendGetRequest(menuItemsTitleHtml, function(itemsTitleRequest) {
            // Retrieve single menu item snippet
            $ajaxUtils.sendGetRequest(menuItemHtml, function(menuItemRequest){
                var menuItemsViewHtml = buildMenuItemsViewHtml(categoryMenuItems, itemsTitleRequest, menuItemRequest);
                insertHtml("#main-content", menuItemsViewHtml);
            }, false);
        }, false);
    }

    // Using category and menu items data and snippets html to build menu items view HTML to be inserted into page
    function buildMenuItemsViewHtml(categoryMenuItems, itemsTitleRequest, menuItemRequest) {
        var menuItemsTitleHtml = itemsTitleRequest.responseText;
        menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "name", categoryMenuItems.category.name);
        menuItemsTitleHtml = insertProperty(menuItemsTitleHtml, "special_instructions", 
                                            categoryMenuItems.category.special_instructions);
        // Loop over menu items
        var finalHtml = menuItemsTitleHtml;
        finalHtml += "<section class='row'>";
        var menuItems = categoryMenuItems.menu_items;
        var catShortName = categoryMenuItems.category.short_name;
        for (var i=0; i < menuItems.length; i++) {
            var html = menuItemRequest.responseText;
            html = insertProperty(html, "short_name", menuItems[i].short_name);
            html = insertProperty(html, "catShortName", catShortName);
            html = insertItemPrice(html, "price_small", menuItems[i].price_small);
            html = insertItemPortionName(html, "portion_small", menuItems[i].small_portion_name);
            html = insertItemPrice(html, "price_large", menuItems[i].price_large);
            html = insertItemPortionName(html, "portion_large", menuItems[i].large_portion_name);
            html = insertProperty(html, "name", menuItems[i].name);
            html = insertProperty(html, "description", menuItems[i].description);
            // if (i%2 != 0){
            //     html += "<div class='clearfix d-none d-md-block'"
            // }
            finalHtml += html;
        }
        finalHtml += "</section>";
        return finalHtml;
    }

    function insertItemPrice(html, pricePropName, priceValue) {
        if (!priceValue) {
            return insertProperty(html, pricePropName, "");
        }
        priceValue = "$" + priceValue.toFixed(2)
        html = insertProperty(html, pricePropName, priceValue);
        return html;
    }

    function insertItemPortionName(html, portionPropName, portionValue) {
        if (!portionValue) {
            return insertProperty(html, portionPropName, "");
        }
        html = insertProperty(html, portionPropName, portionValue);
        return html;
    }

    global.$dc = dc;
})(window);
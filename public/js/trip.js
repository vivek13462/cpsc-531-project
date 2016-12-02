var userCurrent,
    count = 0,
    hopCity = [],
    hopRest = [],
    finalHopList = [];

function init() {
    var cities = ['San-Francisco', 'San-Diego', 'Fullerton', 'Los-Angeles', 'Anaheim', 'San Jose', 'Monterey', 'Palo-Alto', 'Long Beach', 'Santa Monica', 'Sacramento'];
    cities = cities.sort();
    var output = "";
    for (var x in cities) {
        output += "<a onclick=\"getCityRests('" + cities[x] + "')\"class=\"chip\">" +
            cities[x] +
            "</a>&nbsp;&nbsp;&nbsp;";
    }
    $('#cities').append(output);
}

var vm = {
    searchResults: ko.observableArray()
};
ko.applyBindings(vm);


function getCityRests(cityName) {
    $('#modal_citySelect').closeModal();
    Materialize.toast('Searching Restaurants in ' + cityName, 4000);
    count = 1;
    hopCity.push(cityName);
    vm.searchResults.removeAll();
    console.log('You will get ' + cityName);
    //Fetch restaurants nearby
    $.ajax({
        url: '/findHangout',
        dataType: "json",
        data: {
            "cityName": cityName
        },
        type: 'GET',
        success: function(data) {
            //console.log(data);
            data.businesses.forEach(function(business) {
                //console.log(business);
                business.newID = business.id + "123";
                business.newIDlink = "#" + business.newID;
                vm.searchResults.push(business);
                var restaurant = business.name;
            });
            $('#findList').hide();
            $('#findList').fadeIn(3000);
            $('textarea').characterCounter();
            $('select').material_select();
            $(".userReview").hide();
            $('.modal-trigger').leanModal();
        },
        error: function(xhr, status, error) {
            console.log("Restaurant search failed");
        }
    });
}

function addRestToList(data, event) {
    Materialize.toast('Adding ' + data + ' to your plan', 4000);
    hopRest.push(data);
}

function createHopList() {
    var hopTemp = "";
    if (count > 0) {
        for (var x in hopRest) {
            hopTemp += ", " + hopRest[x];
        }
        hopTemp = hopTemp.substring(2);
        var temp = {
            "city": hopCity[0],
            "restaurants": hopTemp
        };
        finalHopList.push(temp);
        hopRest = [];
        hopCity = [];
        console.log(JSON.stringify(finalHopList));
    } else {
        console.log('Error');
    }
}

function saveToDb() {
    $.ajax({
        url: '/saveListToDb',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
            "user": userCurrent,
            "hangoutList": finalHopList
        }),
        type: 'POST',
        success: function(data) {
            console.log('Successfully Saved List');
        },
        error: function(error) {
            console.log('Error: ' + error);
        }
    });
}

$('#saveList').click(function(e) {
    Materialize.toast('Saving your plan to database', 4000);
    $.when(createHopList()).then(saveToDb());
    //saveToDb();
});

$(document).ready(function() {
    init();
    userCurrent = $('#userCurrent').text();
    console.log(userCurrent);
});
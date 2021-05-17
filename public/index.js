// const server = "http://localhost:5000";

const server =  "http://ass2xinxin.us-east-1.elasticbeanstalk.com";

// Render JSON file
function renderJSON(JSONobject, i = 1) {
  let displayHTML = "";
  let itemStart = i * 6 - 6;
  let itemEnd = i * 6;
  let JSONobjectSliced = JSONobject.slice(itemStart, itemEnd);
  JSONobjectSliced.map(function (car) {
    displayHTML += `
                    <div class = carItem id = ${car.id} >
                      <ul>
                        <li><img src = ./CarImg/${car.Model}.png alt = car Image /></li>
                        <li><h3>${car.Brand} - ${car.Model} - ${car["Model Year"]}</h3></li>
                        <li><span>Mileage: </span>${car.Mileage} kms</li>
                        <li><span>Seats: </span>${car.Seats}</li>
                        <li><span>Price per day: </span>${car["Price per day"]}</li>
                        <li><span>Availability: </span>${car.Availability}</li>
                        <li>
                           <div class = "description collapsed" ><span>Description: </span>${car.Description}</div>
                           <div class = seeMore id = ${car.id}_Description onclick = addSeeMore(this)>See more</div>
                        </li>
                        <li><button onclick = processAdd(${car.id}) ><span>Add to Cart</span></button></li>
                      </ul>
                    </div>
                    `;
  });
  document.getElementById("displayContainer").innerHTML = displayHTML;
}

// When "Add to Cart" btn on clicked,
function processAdd(passedID) {
  let availability = $($("#" + passedID).find("li")[5]).text();
  let info = availability.split(":")[1].trim();
  if (info == "Y") {
    fetch(`${server}/query?carModel=${passedID}`)
      .then((response) => response.text())
      .then((response) => {
        alert(response);
      })
      .catch((error) => console.log(error));
  } else {
    alert("Sorry, this car is not available now. Please try other cars.");
  }
}

// add seeMore button
function addSeeMore(element) {
  let seeMoreBtn = $("#" + element.id);
  seeMoreBtn.prev().toggleClass("collapsed");
  if (seeMoreBtn.html() == "See more") {
    seeMoreBtn.html("Collapse");
  } else {
    seeMoreBtn.html("See more");
  }
}

// add pages
function setPages(JSONobject) {
  let pageNumber = Math.ceil(JSONobject.length / 6);
  let pageHtml = "";
  for (let i = 1; i <= pageNumber; i++) {
    pageHtml += `<button type="button" id = page${i} >${i}</button>`;
  }
  $("#pageContainer").html(pageHtml);

  for (let i = 1; i <= pageNumber; i++) {
    $("#" + "page" + i).on("click", function () {
      renderJSON(JSONobject, i);
    });
  }
}

// send request to get and render JSON file

const renderCarInfo = () => {
  fetch(`${server}/carInfo.json`)
    .then((response) => response.json())
    .then((response) => {
      renderJSON(response);
      setPages(response);
    })
    .catch((error) => {
      console.log(error);
    });
};
renderCarInfo();

// when input box changed rerender displayContainer
$("input").on("change", function () {
  let filterList = $("form").serializeArray();
  let filterListMerged = {};
  // empty filterList means no checked box, just render all car items
  if (filterList.length == 0) {
    renderCarInfo();
  }
  // if there is at least one checked box, merge filterList according to Color, Availability and Category
  // then send request, get and filter carInfoObject according to filterListMerged
  else {
    filterList.forEach((listItem) => {
      if (Reflect.has(filterListMerged, listItem.name)) {
        filterListMerged[listItem.name].push(listItem.value);
      } else {
        filterListMerged[listItem.name] = [listItem.value];
      }
    });

    fetch(`${server}/carInfo.json`)
      .then((response) => response.json())
      .then((response) => {
        let filteredResult = response.filter(function (car) {
          let matched = true;
          let keyList = Object.keys(car);
          for (let index in keyList) {
            let key = keyList[index];
            if (Reflect.has(filterListMerged, key)) {
              matched = filterListMerged[key].includes(car[key]);
              if (matched == false) {
                break;
              }
            } else {
              continue;
            }
          }
          return matched;
        });
        if (filteredResult.length == 0) {
          document.getElementById(
            "displayContainer"
          ).innerHTML = `<h3>Sorry, we couldn't find any results.</h3>`;
        } else {
          renderJSON(filteredResult);
          setPages(filteredResult);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }
});

// When CheckOut btn onclicked, render reservation page
$("#checkReservation").on("click", function () {
  fetch(`${server}/reservation`)
    .then((sessionInfo) => sessionInfo.text())
    .then((sessionInfo) => {
      if (sessionInfo.length == 2 || sessionInfo.length == 0) {
        alert("Please add a car.");
        return;
      }
      const getReservation = () => {
        fetch(`${server}/carInfo.json`)
          .then((cars) => cars.json())
          .then((cars) => {
            let carToRender = cars.filter((car) =>
              sessionInfo.includes(car.id)
            );
            renderReservation(carToRender);
          })
          .catch((error) => {
            console.log(error);
          });
      };
      getReservation();
    })
    .catch((error) => {
      console.log(error);
    });
});

function renderReservation(JSONobject) {
  let displayHTML = "";
  JSONobject.map(function (car) {
    displayHTML += `<tr id= ${car.id}_row >
                        <td><img src = ./CarImg/${
                          car.Model
                        }.png alt = car Image /></td>
                        <td>${car.Brand} - ${car.Model} - ${car["Model Year"]}</td>
                        <td>${car["Price per day"]}</td>
                        <td><input type = "number" name = "${
                          car["Price per day"].split("$")[1]
                        }" ></td>
                        <td><button onclick = processDelete(${
                          car.id
                        }) ><span>Delete</span></button></td>
                    </tr>
                  `;
  });
  document.getElementById("firstContainer").innerHTML =
    `<h1 id = reservationHeader>Car Reservation</h1>
     <div id = emptyNotice>
     <form id = "reservationForm"><table>
     <tr>
        <th>Thumbnail</th>
        <th>Vehicle</th>
        <th>Price Per Day</th>
        <th>Rental Days</th>
        <th>Actions</th>
     </tr>` +
    displayHTML +
    `
     </table></form>
     <button id = checkOut onclick = processCheckOut() ><span>Proceeding to CheckOut</span></button>
     </tr>
     </div>`;
}

function redirect() {
  window.location.href = server;
}

// initialize a global variable which can pass to another function scope(dirty)
var totalCost = 0;

// when delete btn onclicked, delete corresponding row, and pop the id out from session.cart
function processDelete(passedID) {
  $("#" + passedID + "_row").remove();
  fetch(`${server}/delete?deleteModel=${passedID}`);
  if ($("tr").length == 1) {
    document.getElementById(
      "emptyNotice"
    ).innerHTML = `<p>No car has been reserved.</p><button class = redirect onclick = redirect()><span>Continue Selection</span></button>`;
  }
}

function processCheckOut() {
  if ($("tr").length == 1) {
    document.getElementById(
      "emptyNotice"
    ).innerHTML = `<p>No car has been reserved.</p><button class = redirect onclick = redirect()><span>Continue Selection</span></button>`;
  }
  // check input value
  let isValidate = true;
  let isExceeded = true;
  $("input").each(function () {
    if ($(this).val() <= 0 || $(this).val() == "") {
      isValidate = false;
    }
    if ($(this).val() > 100) {
      isExceeded = false;
    }
  });
  if (!isValidate) {
    alert("Please enter validate amount.");
    return;
  }
  if (!isExceeded) {
    alert("Sorry, the maximum is 100.");
    return;
  }

  // get the amount of total cost
  let checkOutInfo = $("#reservationForm").serializeArray();
  totalCost = checkOutInfo.reduce(function (accumulator, currentCar) {
    return (accumulator +=
      parseInt(Object.values(currentCar)[0]) *
      parseInt(Object.values(currentCar)[1]));
  }, 0);

  // show checkout page info
  let displayHTML = `
  <h1 id = reservationHeader>Check Out</h1>
  <h3>Customer Details and Payment</h3>
  <h3>Please fill in your details. <span class='required' >*</span>&nbsp;indicates required field.</h3>
  <div class="container">
    <form id = checkoutForm>
      <div class="row">
        <div class="col-25">
          <label for="fname">First Name<span class='required' >*</span></label>
        </div>
        <div class="col-75">
          <input type="text" id="fname" name="firstname">
        </div>
      </div>

      <div class="row">
        <div class="col-25">
          <label for="lname">Last Name<span class='required' >*</span></label>
        </div>
        <div class="col-75">
          <input type="text" id="lname" name="lastname">
        </div>
      </div>

      <div class="row">
        <div class="col-25">
          <label for="lname">Email Address<span class='required' >*</span></label>
        </div>
        <div class="col-75">
          <input type="email" id="email" name="email">
        </div>
      </div>
      
      <div class="row">
        <div class="col-25">
          <label for="addressOne">Address Line 1<span class='required' >*</span></label>
        </div>
        <div class="col-75">
          <input type="text" id="addressOne" name="addressOne">
        </div>
      </div>

      <div class="row">
        <div class="col-25">
          <label for="addressTwo">Address Line 2</label>
        </div>
        <div class="col-75">
          <input type="text" id="addressTwo" name="addressTwo">
        </div>
      </div>

      <div class="row">
        <div class="col-25">
          <label for="city">City<span class='required' >*</span></label>
        </div>
        <div class="col-75">
          <input type="text" id="city" name="city">
        </div>
      </div>


      <div class="row">
        <div class="col-25">
          <label for="state">State<span class='required' >*</span></label>
        </div>
        <div class="col-75">
          <select id="state" name="state">
            <option value="Australian Capital Territory">Australian Capital Territory</option>
            <option value="New South Wales">New South Wales</option>
            <option value="Tasmania">Tasmania</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div class="col-25">
          <label for="postcode">Post Code<span class='required' >*</span></label>
        </div>
        <div class="col-75">
          <input type="number" id="postcode" name="postcode">
        </div>
      </div>

      <div class="row">
        <div class="col-25">
          <label for="payment">Payment Type<span class='required' >*</span></label>
        </div>
        <div class="col-75">
          <select id="payment" name="payment">
            <option value="Credit Card">Credit Card</option>
            <option value="Paypal">Paypal</option>
            <option value="Gift Card">Gift Card</option>
          </select>
        </div>
      </div>
      
      <div class="row">
        <h3>You are required to pay $${totalCost}</h3>
      </div>
    </form>

    <div class="row">
      <button id = booking onclick = processBooking()><span>Booking</span></button>
      <button id = continue onclick = redirect()><span>Continue Selection</span></button>
    </div>

  </div>
  `;
  document.getElementById("firstContainer").innerHTML = displayHTML;
}

function processBooking() {
  // validate input
  if ($("#fname").val() == "") {
    alert("Please enter your first name.");
    return;
  }

  if ($("#lname").val() == "") {
    alert("Please enter your last name.");
    return;
  }

  let email = $("#email").val();
  let regexEmail = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  if (regexEmail.test(email) == false) {
    alert("Wrong email address.");
    return;
  }

  if ($("#addressOne").val() == "") {
    alert("Please enter your address.");
    return;
  }

  if ($("#city").val() == "") {
    alert("Please enter your city.");
    return;
  }

  if ($("#postcode").val() == "") {
    alert("Please enter your post code.");
    return;
  }
  fetch(`${server}/clearcart`);
  let bookingInfo = $("#checkoutForm").serializeArray();
  let displayHTML = `
  <div id = bookingInfo>
    <h3>Hi ${bookingInfo[0]["value"]}, your booking has been received.</h3>
    <h3>Below is your booking information:</h3>
    <table id=bookingTable>
      <tr>
        <th>Address</th>
        <td>${bookingInfo[3]["value"]} ${bookingInfo[4]["value"]} ${bookingInfo[5]["value"]} ${bookingInfo[6]["value"]} ${bookingInfo[7]["value"]}</td>   
      </tr>
      
      <tr>
        <th>Total Cost</th>
        <td>$${totalCost}</td>   
      </tr>

      <tr>
        <th>Payment</th>
        <td>${bookingInfo[8]["value"]}</td>   
      </tr>
    </table>
    <h3>Have a good day.</h3>
  </div>
  `;

  document.getElementById("firstContainer").innerHTML = displayHTML;
}

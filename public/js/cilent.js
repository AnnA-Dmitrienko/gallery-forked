
var date = new Date();
const todayDate = document.querySelector(".date");

function printDate() {
  var date = new Date();
  var day = date.getDate();
  var month = date.getMonth() + 1;
  var year = date.getFullYear();
  todayDate.innerHTML = "Today's date is: " + month + "/" + day + "/" + year;
}

printDate();


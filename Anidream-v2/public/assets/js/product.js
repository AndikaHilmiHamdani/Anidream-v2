var i = 0;
function showNextImage() {
  i++;
  $("#sliderImage" + i)
    .appendTo("#slider")
    .fadeIn(1100)
    .delay(1100)
    .fadeOut(1100);
  if (i == $("#slider > div").length) {
    i = 0;
  }
}

let categories = [];
let sliderInterval;
let promoInterval;
let productDescription = "";

$(document).ready(function () {
  $.getJSON("/assets/data/products.json", ({ products }) => {
    const currentPath = window.location.pathname;
    const product = products.find((item) => item.url == currentPath);
    if (product && product.data) {
      productDescription = product.description?.join("<br>") || "";
      $.getJSON(product.data, ({ data }) => {
        categories = data;
        for (const [idx, category] of Object.entries(data)) {
          const html = `
          <div class="col" data-toggle="modal" data-target="#modal" data-id="${idx}">
            <img src="${category.thumbnail}" alt="">
            <div class="producttitle" id="title">${category.name}</div>
          </div>
          `;
          $("#products .media").append(html);
        }
      });
    } else {
      window.location.href = "/";
    }
  });
});

$("#products .media").on("click", "div", (e) => {
  clearInterval(sliderInterval);
  clearInterval(promoInterval);
  const categoryId = $(e.currentTarget).data("id");
  const product = categories[categoryId];
  if (product) {
    const description = $("<ul></ul>");
    product.description?.map((item) => {
      description.append($("<li></li>").html(item));
    });
    const photos =
      product.photos?.map((item, idx) => {
        return `
      <div id="sliderImage${idx + 1}">
        <img src="${item.url}">
        <div class="slidertitle">${item.label}</div>
      </div>
      `;
      }) || [];
  
    $("#modalTitle").text(product.name);
    $("#modalDesc").html(description);
    $("#productDesc").html(productDescription);
    $("#slider").html(photos.join(""));
  
    const promoTime = product.discountDate ? new Date(product.discountDate).getTime() : 0;
    let now = new Date().getTime();
    let distance = promoTime - now;
    $("#promo").hide();
    $("#price").text(`Rp ${product.price}`);
    if (product.discount && distance > 0) {
      const newPrice = product.price * (100-product.discount)/100;
      $("#price").text(`Rp ${newPrice}`).addClass("text-danger");
      $("#price-discount").text(`Rp ${product.price}`).show();
    } else {
      $("#price-discount").hide();
      $("#price").removeClass("text-danger");
    }
    if (distance > 0) {
      $("#promo").show();
      promoInterval = setInterval(() => {
        now = new Date().getTime();
        distance = promoTime - now;
    
        let days = 0;
        let hours = 0;
        let minutes = 0;
        let seconds = 0;
        if (distance > 0) {
          days = Math.floor(distance / (1000 * 60 * 60 * 24));
          hours = Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
          );
          minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          seconds = Math.floor((distance % (1000 * 60)) / 1000);
        } else {
          $("#promo").hide();
        }
        $("#days").text(days);
        $("#hours").text(hours);
        $("#minutes").text(minutes);
        $("#seconds").text(seconds);

        if (product.discount && distance > 0) {
          const newPrice = product.price * (100-product.discount)/100;
          $("#price").text(`Rp ${newPrice}`).addClass("text-danger");
          $("#price-discount").text(`Rp ${product.price}`).show();
        } else {
          $("#price-discount").hide();
          $("#price").text(`Rp ${product.price}`).removeClass("text-danger");
        }
      }, 1000);
    }
  }

  $('#slider > div').hide()
  showNextImage()
  sliderInterval = setInterval('showNextImage()', 3000);
});

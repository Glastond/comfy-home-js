// Variables
const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDOM = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItems = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDOM = document.querySelector(".products-center");

// Main Cart Array
let cart = [];

// buttons
let buttonsDOM = [];

// Getting the products
class Products {
  async getProduct() {
    try {
      let result = await fetch("./products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.log(error);
    }
  }
}

// display products
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach(product => {
      const { title, price, id, image } = product;
      result += `<article class="product">
        <div class="img-container">
          <img
            src=${image}
            alt="product"
            class="product-img"
          />
          <button class="bag-btn" data-id=${id}>
            <i class="fas fa-shopping-cart"></i> Add to Cart
          </button>
        </div>
        <h3>${title}</h3>
        <h4>$${price}</h4>
      </article>`;
    });
    productsDOM.innerHTML = result;
  }

  getBagButtons() {
    const btns = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = btns;
    btns.forEach(button => {
      let id = button.dataset.id;
      let inCart = cart.find(item => item.id === id);
      if (inCart) {
        button.innerText = "in cart";
        button.disabled = true;
      }
      button.addEventListener("click", event => {
        event.target.innerText = "in cart";
        event.target.disabled = true;

        // Get product from products
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        // add product to the cart
        cart = [...cart, cartItem];

        // save cart to local storage
        Storage.saveCart(cart);
        // set cart values
        this.setCartValues(cart);
        // Display cart items
        this.addCartItem(cartItem);
        // show cart
        this.showCart();
      });
    });
  }

  setCartValues(cart) {
    let tempTotal = 0;
    let ItemsTotal = 0;
    cart.map(item => {
      tempTotal += item.price * item.amount;
      ItemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = ItemsTotal;
  }

  addCartItem(item) {
    let { image, title, price, id, amount } = item;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img src= ${image} alt="product" />
            <div>
              <h4>${title}</h4>
              <h5>$${price}</h5>
              <span class="remove-item" data-id=${id}>
                remove
              </span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${id}></i>
              <p class="item-amount">${amount}</p>
              <i class="fas fa-chevron-down" data-id=${id}></i>
            </div>
            `;

    cartContent.appendChild(div);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDOM.classList.add("showCart");
  }

  // Takes the value from the local storage and saves it in the cart variable.
  setupApp() {
    cart = Storage.getCart(); // setting the value of cart variable before loading the app.
    this.setCartValues(cart);
    this.populate(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }

  // Populate the cart in the DOM.
  populate(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  // Hide cart when you press the X button.
  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDOM.classList.remove("showCart");
  }

  cartLogic() {
    // clear cart btn
    clearCartBtn.addEventListener("click", () => {
      this.clearCart(); //when you are changing any variable in the class you refer the func call in a arrow function.
    });

    // Cart functionality
    cartContent.addEventListener("click", event => {
      if (event.target.classList.contains("remove-item")) {
        let removeItem = event.target;
        let id = removeItem.dataset.id;
        cartContent.removeChild(removeItem.parentElement.parentElement); // Removing it from the DOM
        this.removeItem(id); // revoves it from the cart array
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cart); //updating the change in amount in localStorage
        this.setCartValues(cart); //Updating the cart Total
        addAmount.nextElementSibling.innerText = tempItem.amount;
      } else if (event.target.classList.contains("fa-chevron-down")) {
        let lowerAmount = event.target;
        let id = lowerAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount -= 1;
        if (tempItem.amount > 0) {
          Storage.saveCart(cart); // Change in localStorage
          this.setCartValues(cart); //Updating the cart Total
          lowerAmount.previousElementSibling.innerText = tempItem.amount;
        } else {
          cartContent.removeChild(lowerAmount.parentElement.parentElement);
          this.removeItem(id);
        }
      }
    });
  }

  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }

    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>Add to cart`;
  }

  getSingleButton(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }
}

// Local storage
class Storage {
  // Static methods can be used anywhere without any instanciation.
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }

  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find(product => product.id === id);
  }

  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }

  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const ui = new UI();
  const products = new Products();

  // setup App
  ui.setupApp();

  //   get All products
  products
    .getProduct()
    .then(products => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});

import { Product } from "./Product";

// Constantes
const SERVER_URL = "http://localhost:5000";
const PRODUCTS_PER_PAGE = 9;
const productContainer = document.getElementById("product-container") as HTMLElement;
const btnCarregarMais = document.getElementById("btn-carregar-mais") as HTMLElement;
const verTodasAsCoresBtn = document.getElementById("ver-todas-as-cores") as HTMLElement;
const coresOcultas = document.querySelectorAll(".oculto");
const cartCounter = document.getElementById("count") as HTMLElement; // Contador do carrinho
const cartModal = document.getElementById("cart-modal") as HTMLElement; // Modal do Carrinho
const closeModalButton = document.getElementById("close-modal") as HTMLElement; // Fechar a modal
const cartItemsContainer = document.getElementById("cart-items") as HTMLElement; // Container para os itens no carrinho
const emptyCartButton = document.getElementById("empty-cart") as HTMLElement; // Botão para esvaziar o carrinho
// Seleção de elementos do menu de filtros
const closeFilterMenuButton = document.querySelector(".close-menu") as HTMLButtonElement;
const filterMenumob = document.querySelector(".filters-mobile") as HTMLElement;

// Seleção de elementos do dropdown
const closeDropdownButton = document.querySelector("#dropdown-list .close-drop") as HTMLButtonElement;
const dropdownListmob = document.querySelector("#dropdown-list") as HTMLElement;

// Função para fechar o menu de filtros
function closeFilterMenumob(): void {
  if (filterMenumob) {
    filterMenumob.style.display = 'none';
  }
}

// Adiciona o evento de clique no botão de fechar o menu de filtros
document.addEventListener('DOMContentLoaded', () => {
  if (closeFilterMenuButton) {
    closeFilterMenuButton.addEventListener('click', closeFilterMenu);
  }
});


function closeElement(element: HTMLElement): void {
  if (element) {
    element.classList.add('hidden');
  }
}

// Adiciona evento ao botão de fechar do dropdown
document.addEventListener('DOMContentLoaded', () => {
  closeDropdownButton?.addEventListener('click', () => closeElement(dropdownListmob));
  closeFilterMenuButton?.addEventListener('click', () => closeElement(filterMenu));
});

// Seleção de elementos do menu de filtros
const openFilterMenuButton = document.querySelector(".open-menu") as HTMLButtonElement;
const filterMenu = document.querySelector(".filters-mobile") as HTMLElement;
const applyFilterButton = document.querySelector(".filtrar-produto") as HTMLButtonElement;
const clearFilterButton = document.querySelector("#limpar-filtro") as HTMLButtonElement;

// Função para abrir o menu de filtros
function openFilterMenu(): void {
  if (filterMenu) {
    filterMenu.style.left = "0"; // Exibe o menu lateral
  }
}

// Função para fechar o menu de filtros
function closeFilterMenu(): void {
  if (filterMenu) {
    filterMenu.style.left = "-100%"; // Esconde o menu lateral
  }
}

// Função para aplicar filtros e fechar o menu
function applyFiltersAndClose(): void {
  applyFilters(); // Aplica os filtros existentes
  closeFilterMenu(); // Fecha o menu lateral
}

// Função para limpar filtros e fechar o menu
function clearFiltersAndClose(): void {
  document.querySelectorAll('input[name="color"]:checked, input[name="size"]:checked, input[name="price-filter"]:checked')
    .forEach((checkbox) => (checkbox as HTMLInputElement).checked = false);

  applyFilters(); // Reaplica os filtros (agora sem nenhum selecionado)
  closeFilterMenu(); // Fecha o menu lateral
}

// Eventos dos botões
openFilterMenuButton?.addEventListener("click", openFilterMenu);
applyFilterButton?.addEventListener("click", applyFiltersAndClose);
clearFilterButton?.addEventListener("click", clearFiltersAndClose);



// Seleciona todos os botões de accordion
const accordions: NodeListOf<HTMLButtonElement> = document.querySelectorAll('.accordion');

// Função para fechar todos os accordions (apenas em dispositivos mobile)
function closeAllAccordions(): void {
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (isMobile) {
    accordions.forEach((accordion) => {
      const panel = accordion.nextElementSibling as HTMLElement;
      accordion.classList.remove('active');
      if (panel) {
        panel.style.display = 'none';
      }
    });
  }
}

window.addEventListener('resize', () => {
  closeAllAccordions();
});


// Função para fechar outros accordions, exceto o clicado
function closeOtherAccordions(currentAccordion: HTMLButtonElement): void {
  accordions.forEach((accordion) => {
    if (accordion !== currentAccordion) {
      accordion.classList.remove('active');
      const panel = accordion.nextElementSibling as HTMLElement;
      if (panel) {
        panel.style.display = 'none';
      }
    }
  });
}

// Função para alternar a visibilidade do painel
function toggleAccordion(event: Event): void {
  const clickedAccordion = event.currentTarget as HTMLButtonElement;
  const panel = clickedAccordion.nextElementSibling as HTMLElement;

  if (panel) {
    clickedAccordion.classList.toggle('active');
    panel.style.display = panel.style.display === 'block' ? 'none' : 'block';
  }

  closeOtherAccordions(clickedAccordion);
}

// Inicializa os accordions fechados
document.addEventListener('DOMContentLoaded', () => {
  closeAllAccordions();
  
  // Adiciona o evento de clique a cada accordion
  accordions.forEach((accordion) => {
    accordion.addEventListener('click', toggleAccordion);
  });
});



// Variáveis de controle
let products: Product[] = [];
let displayedCount = 0;
let filteredProducts: Product[] = [...products]


// Função para obter os produtos
async function fetchProducts(): Promise<Product[]> {
  const response = await fetch(`${SERVER_URL}/products`);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
}

function applyFilters(): void {
  const colorFilters = document.querySelectorAll('input[name="color"]:checked') as NodeListOf<HTMLInputElement>;
  const sizeFilters = document.querySelectorAll('input[name="size"]:checked') as NodeListOf<HTMLInputElement>;
  const priceFilters = document.querySelectorAll('input[name="price-filter"]:checked') as NodeListOf<HTMLInputElement>;

  let filtered = [...products];

  // Filtro por cores
  const selectedColors = Array.from(colorFilters).map((checkbox) => checkbox.value);
  if (selectedColors.length > 0) {
    filtered = filtered.filter((product) => selectedColors.includes(product.color));
  }
  
  // Filtro por tamanho
  const selectedSizes = Array.from(sizeFilters).map((checkbox) => checkbox.value);
  if (selectedSizes.length > 0) {
    filtered = filtered.filter((product) => {
      // Se product.size for um array, verifica se algum tamanho corresponde ao filtro
      if (Array.isArray(product.size)) {
        return product.size.some((size) => selectedSizes.includes(size.trim()));
      } else {
        // Caso product.size seja uma string, faz a comparação direta
        return selectedSizes.includes(product.size.trim());
      }
    });
  }

  console.log(selectedSizes); // Verificar quais tamanhos estão sendo filtrados

  // Filtro por faixa de preço
  const selectedPrices = Array.from(priceFilters).map((checkbox) => checkbox.value);
  if (selectedPrices.length > 0) {
    filtered = filtered.filter((product) => {
      return selectedPrices.some((priceRange) => {
        if (priceRange === "0-50" && product.price <= 50) return true;
        if (priceRange === "51-150" && product.price > 50 && product.price <= 150) return true;
        if (priceRange === "151-300" && product.price > 150 && product.price <= 300) return true;
        if (priceRange === "301-500" && product.price > 300 && product.price <= 500) return true;
        if (priceRange === "500+" && product.price > 500) return true;
        return false;
      });
    });
  }

  filteredProducts = filtered;
  displayProducts(filteredProducts); // Exibir os produtos após a filtragem
}


// Elementos do Dropdown
const dropdownButton = document.getElementById("dropdown-button") as HTMLButtonElement;
const dropdownList = document.getElementById("dropdown-list") as HTMLUListElement;

// Função para ordenar e exibir produtos
function sortProducts(sortType: string): void {
  if (sortType === "preco-crescente") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortType === "preco-decrescente") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortType === "recente") {
    filteredProducts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Renderiza os produtos ordenados
  displayProducts(filteredProducts);
}

// Alternar visibilidade do Dropdown
dropdownButton.addEventListener("click", () => {
  dropdownList.classList.toggle("hidden");
});

// Selecionar uma opção e aplicar ordenação
dropdownList.querySelectorAll("li").forEach((item) => {
  item.addEventListener("click", (event) => {
    const selectedItem = event.target as HTMLLIElement;
    const sortType = selectedItem.getAttribute("data-value") || "";

    // Altera o texto do botão com o nome da opção selecionada
    dropdownButton.textContent = selectedItem.textContent || "Ordenar por";

    // Aplica o filtro de ordenação
    sortProducts(sortType);

    // Fecha o dropdown
    dropdownList.classList.add("hidden");
  });
});

// Fecha o dropdown ao clicar fora
document.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (!dropdownButton.contains(target) && !dropdownList.contains(target)) {
    dropdownList.classList.add("hidden");
  }
});

// Seleção de elementos
const dropdownButtonMob = document.getElementById('dropdown-button');
const dropdownListMob = document.getElementById('dropdown-list');
const dropdownOverlay = document.getElementById('dropdown-overlay');

// Função para abrir/fechar o menu
function toggleDropdownMenu() {
  dropdownListMob?.classList.toggle('active');
  dropdownOverlay?.classList.toggle('active');
}

// Evento no botão de ordenação
dropdownButtonMob?.addEventListener('click', toggleDropdownMenu);

// Fechar menu ao clicar fora
dropdownOverlay?.addEventListener('click', toggleDropdownMenu);

// Adicionar evento aos itens da lista
const dropdownItems = dropdownList?.querySelectorAll('li');
dropdownItems?.forEach((item) => {
  item.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    const selectedValue = target.dataset.value;
    console.log(`Ordenar por: ${selectedValue}`);
    toggleDropdownMenu();
  });
});


// Função para exibir produtos
function displayProducts(productsToDisplay: Product[]): void {
  if (!productContainer) return; 

  // Limpa os produtos exibidos anteriormente
  productContainer.innerHTML = "";

  productsToDisplay.forEach((product) => {
    const productCard = createProductCard(product);
    productContainer.appendChild(productCard);
  });
}

// Função para criar o card de cada produto
function createProductCard(product: Product): HTMLElement {
  const productCard = document.createElement("div");
  productCard.classList.add("product-card");

  productCard.innerHTML = `
    <div class="img-produto">
      <img src="${product.image}" alt="${product.name}">
    </div>
    <div class="img-props">
      <p class="name-product">${product.name}</p>
      <p class="price-product">R$ ${product.price.toFixed(2).replace('.', ',')}</p>
      <p class="parcelamento-product">até ${product.parcelamento[0]}x de R$ ${product.parcelamento[1].toFixed(2).replace('.', ',')}</p>
      <p class="size-product">Tamanho: ${product.size}</p>
      <p class="color-product">Cor: ${product.color}</p>
      <button class="btn-comprar" data-product-id="${product.id}">COMPRAR</button>
    </div>
  `;

  // Adiciona evento de compra ao botão
  const buyButton = productCard.querySelector(".btn-comprar") as HTMLButtonElement;
  buyButton.addEventListener("click", () => addToCart(product));

  return productCard;
}

// Função para carregar mais produtos
function loadMoreProducts(): void {
  const nextProducts = filteredProducts.length > 0 ? filteredProducts : products; // Usa produtos filtrados, se houver
  const productsToLoad = nextProducts.slice(displayedCount, displayedCount + PRODUCTS_PER_PAGE);

  productsToLoad.forEach((product) => {
    const productCard = createProductCard(product);
    productContainer.appendChild(productCard);
  });

  displayedCount += PRODUCTS_PER_PAGE;

  // Esconde o botão se não houver mais produtos para carregar
  if (displayedCount >= nextProducts.length && btnCarregarMais) {
    btnCarregarMais.style.display = "none";
  }
}

btnCarregarMais?.addEventListener("click", loadMoreProducts);





// Função para adicionar o produto ao carrinho
function addToCart(product: Product): void {
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  const existingProduct = cart.find((item: Product) => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity = (existingProduct.quantity || 0) + 1;
  } else {
    product.quantity = 1;
    cart.push(product);
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
}

// Função para atualizar o contador do carrinho
function updateCartCounter(): void {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]"); 
  const totalItems = cart.reduce((total: number, item: Product) => total + (item.quantity || 0), 0);

  if (cartCounter) {
    cartCounter.textContent = totalItems.toString();
  }
}


// Função para abrir a modal do carrinho
function openCartModal(): void {
  cartModal.style.display = "block";
  displayCartItems();
}

// Função para exibir os itens do carrinho na modal
function displayCartItems(): void {
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  cartItemsContainer.innerHTML = '';

  if (cart.length > 0) {
    cart.forEach((product: Product) => {
      const item = document.createElement("div");
      item.classList.add("cart-item");
      item.innerHTML = `
        <p>${product.name} - ${product.quantity}x</p>
      `;
      cartItemsContainer.appendChild(item);
    });
  } else {
    cartItemsContainer.innerHTML = "<p>Carrinho vazio.</p>";
  }
}

// Função para esvaziar o carrinho
function emptyCart(): void {
  localStorage.removeItem("cart");
  updateCartCounter();
  displayCartItems();
}

// Evento de clique no contador do carrinho
cartCounter?.addEventListener("click", openCartModal);

// Evento de fechar a modal
closeModalButton?.addEventListener("click", () => {
  cartModal.style.display = "none";
});

// Evento de esvaziar o carrinho
emptyCartButton?.addEventListener("click", emptyCart);

// Inicializa a aplicação
async function initializeApp(): Promise<void> {
  try {
    products = await fetchProducts();
    loadMoreProducts(); // Carrega os primeiros 9 produtos
    filteredProducts = [...products]; // Inicializa a lista filtrada
    displayedCount = 0; // Reinicia o contador de produtos exibidos
    
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
  }

  updateCartCounter();
}

// Evento para mostrar as cores ocultas
function mostrarCoresOcultas(): void {
  coresOcultas.forEach((cor) => cor.classList.remove("oculto"));
}

// Inicializa a aplicação após o carregamento da página
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  filteredProducts = [...products]; // Inicializa a lista filtrada
  verTodasAsCoresBtn?.addEventListener("click", mostrarCoresOcultas);

  // Adiciona eventos para os filtros
  document.querySelectorAll('input[name="color"], input[name="size"], input[name="price-filter"]').forEach((input) => {
    input.addEventListener("change", applyFilters);
  });
});

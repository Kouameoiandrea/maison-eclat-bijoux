let cart = [];
let products = [];
let allProducts = [];
let categories = [];
let selectedCategory = '';
let searchQuery = '';
let sortMode = 'featured';
let minimumPrice = '';
let maximumPrice = '';
let availableOnly = false;
let currentPage = 1;
let activeNavAction = 'all';
let currentLanguage = 'fr';
const productsPerPage = 15;

const translations = {
    ar: {
        languageLabel: 'اللغة',
        deliverTo: 'توصيل إلى',
        hello: 'مرحبا',
        signIn: 'تسجيل الدخول',
        adminTop: 'لوحة',
        adminBottom: 'تحكم',
        cart: 'سلة التسوق',
        searchPlaceholder: 'البحث عن منتج',
        search: 'بحث',
        allShort: 'الكل',
        allCategories: 'جميع الفئات',
        navAll: 'الكل',
        flashSales: 'عروض فلاش',
        bestSales: 'الأكثر مبيعا',
        newItems: 'وصول جديد',
        customerService: 'خدمة العملاء',
        heroEyebrow: 'مجموعة المجوهرات في أبيدجان',
        heroTitle: 'بريق المجوهرات وأناقة الساعات',
        heroText: 'عقود مشرقة وسلاسل أنيقة وأساور وخواتم وأقراط وساعات فاخرة بأسعار واضحة بالفرنك الإفريقي.',
        exploreCollection: 'استكشف المجموعة',
        newProducts: 'وصول جديد',
        productPrices: 'أسعار المنتجات',
        fromPrice: 'من 9000 فرنك إفريقي',
        securePayment: 'دفع آمن',
        simpleOrder: 'طلب بسيط وسريع',
        returns: 'إرجاع لمدة 14 يوم',
        returnHelp: 'إذا كان الحجم غير مناسب',
        home: 'الرئيسية',
        jewelry: 'المجوهرات',
        breadcrumbCurrent: 'عقود وأساور وساعات',
        products: 'منتجات',
        pages: 'صفحات',
        categories: 'فئات',
        sortBy: 'ترتيب حسب',
        featured: 'ذات صلة',
        priceAsc: 'السعر: من الأقل للأعلى',
        priceDesc: 'السعر: من الأعلى للأقل',
        stockDesc: 'أفضل مخزون',
        refineBy: 'تنقيح',
        department: 'القسم',
        price: 'السعر',
        minFcfa: 'الحد الأدنى بالفرنك الإفريقي',
        maxFcfa: 'الحد الأقصى بالفرنك الإفريقي',
        availability: 'التوفر',
        inStockOnly: 'عرض العناصر المتوفرة فقط',
        resultsFor: 'النتائج ل',
        browseHelp: 'تصفح المجوهرات والساعات حسب الصفحة للعثور بسرعة على الموديل الذي تريده.',
        commitments: 'التزاماتنا',
        commitmentTitle: 'مجوهرات مختارة بعناية',
        commitmentText: 'اكتشف مجموعة أنيقة من العقود والسلاسل والأساور والخواتم والأقراط والساعات.',
        presentedTitle: 'صفحات منتجات واضحة',
        presentedText: 'يعرض كل موديل صورته وسعره بالفرنك الإفريقي والتفاصيل المفيدة.',
        simpleBuyTitle: 'تسوق بسيط',
        simpleBuyText: 'أضف المجوهرات إلى سلتك وقم بتحضير طلبك في بضع نقرات.',
        comfortTitle: 'الراحة في كل مكان',
        comfortText: 'البوتيك يبقى ممتعا للاستخدام على الهاتف والجهاز اللوحي والكمبيوتر.',
        contactEyebrow: 'اتصال',
        contactTitle: 'هل تحتاج إلى قطعة محددة؟',
        name: 'الاسم',
        fullName: 'الاسم الكامل',
        phone: 'الهاتف',
        email: 'البريد الإلكتروني',
        message: 'الرسالة',
        send: 'إرسال',
        yourCart: 'سلتك',
        close: 'إغلاق',
        deliveryAddress: 'عنوان التسليم',
        total: 'الإجمالي',
        order: 'طلب',
        footerNote: 'الأسعار بالفرنك الإفريقي لساحل العاج.',
        noProducts: 'لا توجد منتجات في هذه الفئة.',
        reviews: 'تقييمات',
        fastDelivery: 'توصيل سريع في أبيدجان',
        stock: 'في المخزون',
        viewDetails: 'عرض التفاصيل',
        addToCart: 'إضافة إلى السلة',
        previous: 'السابق',
        next: 'التالي',
        resultIn: 'النتائج ل',
        allCategoriesLower: 'جميع الفئات',
        pageHelp: 'استخدم التالي أو الأرقام لتغيير الصفحة.',
        jewelryLower: 'المجوهرات',
        rating: '4.7 من 5',
        priceNote: 'السعر بالفرنك الإفريقي لساحل العاج.',
        checkedBeforeDelivery: 'المنتج فحص قبل التسليم.',
        returnPossible: 'الإرجاع ممكن إذا لم يكن الحجم مناسبا.',
        stockAvailable: 'المخزون المتاح',
        piece: 'قطعة.',
        deliveryAvailable: 'التسليم متاح في أبيدجان وساحل العاج',
        outOfStock: 'نفد المخزون',
        quantity: 'الكمية',
        buyNow: 'اشتري الآن',
        related: 'عناصر مماثلة',
        noRelated: 'لا توجد عناصر أخرى في الوقت الحالي.',
        emptyCart: 'سلتك فارغة.',
        removeOne: 'إزالة وحدة واحدة',
        addOne: 'إضافة وحدة واحدة',
        removeFromCart: 'إزالة من السلة',
        loadingOrder: 'حفظ...',
        loadingContact: 'إرسال...',
        requiredOrder: 'الاسم والهاتف مطلوبان لتأكيد الطلب.',
        orderError: 'لا يمكن إرسال الطلب.',
        orderSuccess: 'تم حفظ الطلب. سنتصل بك لتأكيده.',
        contactError: 'لا يمكن إرسال الرسالة.',
        contactSuccess: 'تم حفظ الرسالة بنجاح.',
        categoriesError: 'لا يمكن تحميل الفئات.',
        productsError: 'لا يمكن تحميل المنتجات.',
        languageChanged: 'تم تغيير اللغة إلى العربية.',
        addedToCart: 'تمت إضافتها إلى السلة.',
        menuOpen: 'فتح القائمة',
        cartOpen: 'فتح السلة',
        detailClose: 'إغلاق التفاصيل',
        cartClose: 'إغلاق السلة',
        pageTitle: 'مايسون إكلات مجوهرات | عقود وساعات وأساور',
        authSignIn: 'تسجيل الدخول',
        authRegister: 'إنشاء حساب',
        authEmail: 'البريد الإلكتروني',
        authPassword: 'كلمة المرور',
        authFullName: 'الاسم الكامل',
        authPhone: 'رقم الهاتف',
        authConfirmPassword: 'تأكيد كلمة المرور',
        authLoginButton: 'تسجيل الدخول',
        authRegisterButton: 'إنشاء حساب',
        authLoginError: 'فشل تسجيل الدخول. تحقق من بيانات المستخدم.',
        authRegisterError: 'فشل إنشاء الحساب. قد يكون البريد الإلكتروني مستخدما بالفعل.',
        authSuccess: 'تم بنجاح!',
        authLogout: 'تسجيل الخروج',
        authMyAccount: 'حسابي'
    },
    es: {
        languageLabel: 'Idioma',
        deliverTo: 'Entregar a',
        hello: 'Hola',
        signIn: 'Iniciar sesión',
        adminTop: 'Panel',
        adminBottom: 'administrador',
        cart: 'Carrito',
        searchPlaceholder: 'Buscar un producto',
        search: 'Buscar',
        allShort: 'Todos',
        allCategories: 'Todas las categorías',
        navAll: 'Todos',
        flashSales: 'Ofertas flash',
        bestSales: 'Más vendidos',
        newItems: 'Nuevas llegadas',
        customerService: 'Servicio al cliente',
        heroEyebrow: 'Colección de joyas en Abidján',
        heroTitle: 'Brillo de joyas, estilo de reloj',
        heroText: 'Collares brillantes, cadenas elegantes, pulseras, anillos, aretes y relojes premium con precios claros en francos de África Occidental.',
        exploreCollection: 'Explorar la colección',
        newProducts: 'Nuevas llegadas',
        productPrices: 'Precios de productos',
        fromPrice: 'desde 9,000 francos de África Occidental',
        securePayment: 'Pago seguro',
        simpleOrder: 'pedido simple y rápido',
        returns: 'Devoluciones de 14 días',
        returnHelp: 'si el tamaño no es el adecuado',
        home: 'Inicio',
        jewelry: 'Joyas',
        breadcrumbCurrent: 'Collares, pulseras y reloj',
        products: 'productos',
        pages: 'páginas',
        categories: 'categorías',
        sortBy: 'Ordenar por',
        featured: 'Relevancia',
        priceAsc: 'Precio: menor a mayor',
        priceDesc: 'Precio: mayor a menor',
        stockDesc: 'Mejor stock',
        refineBy: 'Refinar por',
        department: 'Departamento',
        price: 'Precio',
        minFcfa: 'Mínimo en francos de África Occidental',
        maxFcfa: 'Máximo en francos de África Occidental',
        availability: 'Disponibilidad',
        inStockOnly: 'Mostrar solo artículos en stock',
        resultsFor: 'Resultados para',
        browseHelp: 'Explore joyas y relojes por página para encontrar rápidamente el modelo que desea.',
        commitments: 'Nuestros compromisos',
        commitmentTitle: 'Joyas elegidas con cuidado',
        commitmentText: 'Descubre una selección elegante de collares, cadenas, pulseras, anillos, aretes y reloj.',
        presentedTitle: 'Páginas de productos claras',
        presentedText: 'Cada modelo muestra su foto, precio en francos de África Occidental y detalles útiles.',
        simpleBuyTitle: 'Compra simple',
        simpleBuyText: 'Agrega joyas a tu carrito, cambia cantidades y prepara tu pedido en unos pocos clics.',
        comfortTitle: 'Comodidad en todas partes',
        comfortText: 'La tienda sigue siendo agradable de usar en teléfono, tableta y computadora.',
        contactEyebrow: 'Contacto',
        contactTitle: 'Necesita una pieza específica?',
        name: 'Nombre',
        fullName: 'Nombre completo',
        phone: 'Teléfono',
        email: 'Correo electrónico',
        message: 'Mensaje',
        send: 'Enviar',
        yourCart: 'Tu carrito',
        close: 'Cerrar',
        deliveryAddress: 'Dirección de entrega',
        total: 'Total',
        order: 'Pedido',
        footerNote: 'Los precios se muestran en francos de África Occidental para Costa de Marfil.',
        noProducts: 'No hay productos disponibles en esta categoría.',
        reviews: 'reseñas',
        fastDelivery: 'Entrega rápida en Abidján',
        stock: 'en stock',
        viewDetails: 'Ver detalles',
        addToCart: 'Añadir al carrito',
        previous: 'Anterior',
        next: 'Siguiente',
        resultIn: 'resultado(s) en',
        allCategoriesLower: 'todas las categorías',
        pageHelp: 'usa Siguiente o los números para cambiar de página.',
        jewelryLower: 'joyas',
        rating: '4.7 de 5',
        priceNote: 'Precio mostrado en francos de África Occidental para Costa de Marfil.',
        checkedBeforeDelivery: 'Producto revisado antes de la entrega.',
        returnPossible: 'Devolución posible si el tamaño no es el adecuado.',
        stockAvailable: 'Stock disponible',
        piece: 'pieza(s).',
        deliveryAvailable: 'Entrega disponible en Abidján y Costa de Marfil',
        outOfStock: 'Agotado',
        quantity: 'Cantidad',
        buyNow: 'Comprar ahora',
        related: 'Artículos similares',
        noRelated: 'Sin otro artículo por ahora.',
        emptyCart: 'Tu carrito está vacío.',
        removeOne: 'Eliminar una unidad',
        addOne: 'Añadir una unidad',
        removeFromCart: 'Eliminar del carrito',
        loadingOrder: 'Guardando...',
        loadingContact: 'Enviando...',
        requiredOrder: 'Nombre y teléfono requeridos para confirmar el pedido.',
        orderError: 'No se puede enviar el pedido.',
        orderSuccess: 'Pedido guardado. Nos pondremos en contacto para confirmarlo.',
        contactError: 'No se puede enviar el mensaje.',
        contactSuccess: 'Mensaje guardado exitosamente.',
        categoriesError: 'No se pueden cargar las categorías.',
        productsError: 'No se pueden cargar los productos.',
        languageChanged: 'Idioma cambiado a español.',
        addedToCart: 'agregado al carrito.',
        menuOpen: 'Abrir menú',
        cartOpen: 'Abrir carrito',
        detailClose: 'Cerrar detalles',
        cartClose: 'Cerrar carrito',
        pageTitle: 'Maison Eclat Joyas | Collares, relojes y pulseras'
    },
    de: {
        languageLabel: 'Sprache',
        deliverTo: 'Lieferung nach',
        hello: 'Hallo',
        signIn: 'Anmelden',
        adminTop: 'Verwaltung',
        adminBottom: 'Dashboard',
        cart: 'Warenkorb',
        searchPlaceholder: 'Ein Produkt suchen',
        search: 'Suchen',
        allShort: 'Alle',
        allCategories: 'Alle Kategorien',
        navAll: 'Alle',
        flashSales: 'Blitzverkäufe',
        bestSales: 'Bestseller',
        newItems: 'Neuankünfte',
        customerService: 'Kundenservice',
        heroEyebrow: 'Schmuckkollektion in Abidjan',
        heroTitle: 'Glanz von Schmuck, Stil von Uhren',
        heroText: 'Glänzende Halsketten, elegante Ketten, Armbänder, Ringe, Ohrringe und hochwertige Uhren mit klaren CFA-Franken-Preisen.',
        exploreCollection: 'Erkunden Sie die Kollektion',
        newProducts: 'Neuankünfte',
        productPrices: 'Produktpreise',
        fromPrice: 'ab 9.000 CFA-Franken',
        securePayment: 'Sichere Bezahlung',
        simpleOrder: 'einfache und schnelle Bestellung',
        returns: '14-Tage-Rückkehr',
        returnHelp: 'wenn die Größe nicht passt',
        home: 'Startseite',
        jewelry: 'Schmuck',
        breadcrumbCurrent: 'Halsketten, Armbänder und Uhren',
        products: 'Produkte',
        pages: 'Seiten',
        categories: 'Kategorien',
        sortBy: 'Sortieren nach',
        featured: 'Relevanz',
        priceAsc: 'Preis: niedrig bis hoch',
        priceDesc: 'Preis: hoch bis niedrig',
        stockDesc: 'Bester Bestand',
        refineBy: 'Verfeinern nach',
        department: 'Abteilung',
        price: 'Preis',
        minFcfa: 'Mindestbetrag in CFA-Franken',
        maxFcfa: 'Höchstbetrag in CFA-Franken',
        availability: 'Verfügbarkeit',
        inStockOnly: 'Nur Artikel auf Lager anzeigen',
        resultsFor: 'Ergebnisse für',
        browseHelp: 'Durchsuchen Sie Schmuck und Uhren nach Seite, um das gewünschte Modell schnell zu finden.',
        commitments: 'Unsere Zusagen',
        commitmentTitle: 'Sorgfältig ausgewählter Schmuck',
        commitmentText: 'Entdecken Sie eine elegante Auswahl an Halsketten, Ketten, Armbändern, Ringen, Ohrringen und Uhren.',
        presentedTitle: 'Klare Produktseiten',
        presentedText: 'Jedes Modell zeigt sein Foto, seinen Preis in CFA-Franken und hilfreiche Details.',
        simpleBuyTitle: 'Einfaches Einkaufen',
        simpleBuyText: 'Fügen Sie Schmuck zu Ihrem Warenkorb hinzu, ändern Sie Mengen und bereiten Sie Ihre Bestellung vor.',
        comfortTitle: 'Überall Komfort',
        comfortText: 'Der Shop bleibt auf Telefon, Tablet und Computer angenehm zu bedienen.',
        contactEyebrow: 'Kontakt',
        contactTitle: 'Benötigen Sie ein bestimmtes Stück?',
        name: 'Name',
        fullName: 'Vollständiger Name',
        phone: 'Telefon',
        email: 'E-Mail',
        message: 'Nachricht',
        send: 'Senden',
        yourCart: 'Ihr Warenkorb',
        close: 'Schließen',
        deliveryAddress: 'Lieferadresse',
        total: 'Gesamt',
        order: 'Bestellung',
        footerNote: 'Preise in CFA-Franken für Elfenbeinküste.',
        noProducts: 'Keine Produkte in dieser Kategorie verfügbar.',
        reviews: 'Bewertungen',
        fastDelivery: 'Schnelle Lieferung in Abidjan',
        stock: 'auf Lager',
        viewDetails: 'Details anzeigen',
        addToCart: 'In den Warenkorb legen',
        previous: 'Vorherige',
        next: 'Nächste',
        resultIn: 'Ergebnis(se) in',
        allCategoriesLower: 'alle kategorien',
        pageHelp: 'Verwenden Sie Weiter oder die Zahlen, um die Seite zu wechseln.',
        jewelryLower: 'schmuck',
        rating: '4.7 von 5',
        priceNote: 'Preis in CFA-Franken für Elfenbeinküste.',
        checkedBeforeDelivery: 'Produkt vor Lieferung geprüft.',
        returnPossible: 'Rücksendung möglich, wenn die Größe nicht passt.',
        stockAvailable: 'Lagerbestand verfügbar',
        piece: 'Stück.',
        deliveryAvailable: 'Lieferung nach Abidjan und Elfenbeinküste verfügbar',
        outOfStock: 'Ausverkauft',
        quantity: 'Menge',
        buyNow: 'Jetzt kaufen',
        related: 'Ähnliche Artikel',
        noRelated: 'Vorerst keine weitere Artikel.',
        emptyCart: 'Ihr Warenkorb ist leer.',
        removeOne: 'Eine Einheit entfernen',
        addOne: 'Eine Einheit hinzufügen',
        removeFromCart: 'Aus dem Warenkorb entfernen',
        loadingOrder: 'Speichern...',
        loadingContact: 'Wird gesendet...',
        requiredOrder: 'Name und Telefon sind erforderlich, um die Bestellung zu bestätigen.',
        orderError: 'Bestellung kann nicht gesendet werden.',
        orderSuccess: 'Bestellung gespeichert. Wir werden Sie zur Bestätigung kontaktieren.',
        contactError: 'Nachricht kann nicht gesendet werden.',
        contactSuccess: 'Nachricht erfolgreich gespeichert.',
        categoriesError: 'Kategorien können nicht geladen werden.',
        productsError: 'Produkte können nicht geladen werden.',
        languageChanged: 'Sprache in Deutsch geändert.',
        addedToCart: 'in den Warenkorb gelegt.',
        menuOpen: 'Menü öffnen',
        cartOpen: 'Warenkorb öffnen',
        detailClose: 'Details schließen',
        cartClose: 'Warenkorb schließen',
        pageTitle: 'Maison Eclat Schmuck | Halsketten, Uhren und Armbänder'
    },
    pt: {
        languageLabel: 'Idioma',
        deliverTo: 'Entregar em',
        hello: 'Olá',
        signIn: 'Entrar',
        adminTop: 'Painel',
        adminBottom: 'admin',
        cart: 'Carrinho',
        searchPlaceholder: 'Procurar um produto',
        search: 'Procurar',
        allShort: 'Todos',
        allCategories: 'Todas as categorias',
        navAll: 'Todos',
        flashSales: 'Vendas relâmpago',
        bestSales: 'Mais vendidos',
        newItems: 'Novidades',
        customerService: 'Serviço ao cliente',
        heroEyebrow: 'Colecção de jóias em Abidjan',
        heroTitle: 'Brilho de jóias, estilo de relógio',
        heroText: 'Colares brilhantes, correntes elegantes, pulseiras, anéis, brincos e relógios premium com preços claros em francos CFA.',
        exploreCollection: 'Explorar a colecção',
        newProducts: 'Novidades',
        productPrices: 'Preços dos produtos',
        fromPrice: 'a partir de 9.000 francos CFA',
        securePayment: 'Pagamento seguro',
        simpleOrder: 'encomenda simples e rápida',
        returns: 'Devoluções de 14 dias',
        returnHelp: 'se o tamanho não se adequar',
        home: 'Início',
        jewelry: 'Jóias',
        breadcrumbCurrent: 'Colares, pulseiras e relógios',
        products: 'produtos',
        pages: 'páginas',
        categories: 'categorias',
        sortBy: 'Ordenar por',
        featured: 'Relevância',
        priceAsc: 'Preço: menor para maior',
        priceDesc: 'Preço: maior para menor',
        stockDesc: 'Melhor stock',
        refineBy: 'Refinar por',
        department: 'Departamento',
        price: 'Preço',
        minFcfa: 'Mínimo em francos CFA',
        maxFcfa: 'Máximo em francos CFA',
        availability: 'Disponibilidade',
        inStockOnly: 'Mostrar apenas itens em stock',
        resultsFor: 'Resultados para',
        browseHelp: 'Procure jóias e relógios por página para encontrar rapidamente o modelo desejado.',
        commitments: 'Os nossos compromissos',
        commitmentTitle: 'Jóias cuidadosamente selecionadas',
        commitmentText: 'Descubra uma seleção elegante de colares, correntes, pulseiras, anéis, brincos e relógios.',
        presentedTitle: 'Páginas de produtos claras',
        presentedText: 'Cada modelo mostra sua foto, preço em francos CFA e detalhes úteis.',
        simpleBuyTitle: 'Compras simples',
        simpleBuyText: 'Adicione jóias ao seu carrinho, mude quantidades e prepare sua encomenda em alguns cliques.',
        comfortTitle: 'Conforto em todo o lado',
        comfortText: 'A loja continua agradável de usar em telefone, tablet e computador.',
        contactEyebrow: 'Contacto',
        contactTitle: 'Precisa de uma peça específica?',
        name: 'Nome',
        fullName: 'Nome completo',
        phone: 'Telefone',
        email: 'Email',
        message: 'Mensagem',
        send: 'Enviar',
        yourCart: 'Seu carrinho',
        close: 'Fechar',
        deliveryAddress: 'Endereço de entrega',
        total: 'Total',
        order: 'Encomenda',
        footerNote: 'Preços mostrados em francos CFA para Costa do Marfim.',
        noProducts: 'Nenhum produto disponível nesta categoria.',
        reviews: 'avaliações',
        fastDelivery: 'Entrega rápida em Abidjan',
        stock: 'em stock',
        viewDetails: 'Ver detalhes',
        addToCart: 'Adicionar ao carrinho',
        previous: 'Anterior',
        next: 'Próximo',
        resultIn: 'resultado(s) em',
        allCategoriesLower: 'todas as categorias',
        pageHelp: 'use Próximo ou os números para mudar de página.',
        jewelryLower: 'jóias',
        rating: '4.7 de 5',
        priceNote: 'Preço mostrado em francos CFA para Costa do Marfim.',
        checkedBeforeDelivery: 'Produto verificado antes da entrega.',
        returnPossible: 'Devolução possível se o tamanho não se adequar.',
        stockAvailable: 'Stock disponível',
        piece: 'peça(s).',
        deliveryAvailable: 'Entrega disponível em Abidjan e Costa do Marfim',
        outOfStock: 'Fora de stock',
        quantity: 'Quantidade',
        buyNow: 'Comprar agora',
        related: 'Itens semelhantes',
        noRelated: 'Nenhum outro item por enquanto.',
        emptyCart: 'Seu carrinho está vazio.',
        removeOne: 'Remover uma unidade',
        addOne: 'Adicionar uma unidade',
        removeFromCart: 'Remover do carrinho',
        loadingOrder: 'Guardando...',
        loadingContact: 'Enviando...',
        requiredOrder: 'Nome e telefone são necessários para confirmar a encomenda.',
        orderError: 'Não é possível enviar a encomenda.',
        orderSuccess: 'Encomenda guardada. Entraremos em contacto para confirmar.',
        contactError: 'Não é possível enviar a mensagem.',
        contactSuccess: 'Mensagem guardada com sucesso.',
        categoriesError: 'Não é possível carregar as categorias.',
        productsError: 'Não é possível carregar os produtos.',
        languageChanged: 'Idioma alterado para português.',
        addedToCart: 'adicionado ao carrinho.',
        menuOpen: 'Abrir menu',
        cartOpen: 'Abrir carrinho',
        detailClose: 'Fechar detalhes',
        cartClose: 'Fechar carrinho',
        pageTitle: 'Maison Eclat Jóias | Colares, relógios e pulseiras'
    },
    fr: {
        languageLabel: 'Langue',
        deliverTo: 'Livrer a',
        hello: 'Bonjour',
        signIn: 'Identifiez-vous',
        adminTop: 'Tableau',
        adminBottom: 'admin',
        cart: 'Panier',
        searchPlaceholder: 'Rechercher un produit',
        search: 'Rechercher',
        allShort: 'Toutes',
        allCategories: 'Toutes les categories',
        navAll: 'Toutes',
        flashSales: 'Ventes Flash',
        bestSales: 'Meilleures ventes',
        newItems: 'Nouveautes',
        customerService: 'Service client',
        heroEyebrow: 'Collection bijoux a Abidjan',
        heroTitle: "L'eclat des bijoux, le style des montres",
        heroText: 'Colliers lumineux, chaines elegantes, bracelets, bagues, boucles et montres premium avec des prix clairs en FCFA.',
        exploreCollection: 'Explorer la collection',
        newProducts: 'Nouveautes',
        productPrices: 'Prix des produits',
        fromPrice: 'des 9 000 FCFA',
        securePayment: 'Paiement securise',
        simpleOrder: 'commande simple et rapide',
        returns: 'Retour 14 jours',
        returnHelp: 'si la taille ne convient pas',
        home: 'Accueil',
        jewelry: 'Bijoux',
        breadcrumbCurrent: 'Colliers, bracelets et montres',
        products: 'produits',
        pages: 'pages',
        categories: 'categories',
        sortBy: 'Trier par',
        featured: 'Pertinence',
        priceAsc: 'Prix croissant',
        priceDesc: 'Prix decroissant',
        stockDesc: 'Meilleur stock',
        refineBy: 'Affiner par',
        department: 'Departement',
        price: 'Prix',
        minFcfa: 'Minimum FCFA',
        maxFcfa: 'Maximum FCFA',
        availability: 'Disponibilite',
        inStockOnly: 'Inclure uniquement les articles en stock',
        resultsFor: 'Resultats pour',
        browseHelp: 'Parcourez les bijoux et montres par pages pour trouver rapidement le modele voulu.',
        commitments: 'Nos engagements',
        commitmentTitle: 'Des bijoux choisis avec soin',
        commitmentText: 'Decouvrez une selection elegante de colliers, chaines, bracelets, bagues, boucles et montres pour offrir ou se faire plaisir.',
        presentedTitle: 'Articles bien presentes',
        presentedText: 'Chaque modele affiche sa photo, son prix en FCFA et les details utiles pour choisir facilement.',
        simpleBuyTitle: 'Achat simple',
        simpleBuyText: 'Ajoutez vos bijoux au panier, changez les quantites et preparez votre commande en quelques clics.',
        comfortTitle: 'Confort partout',
        comfortText: 'La boutique reste agreable a utiliser sur telephone, tablette et ordinateur.',
        contactEyebrow: 'Contact',
        contactTitle: "Besoin d'un bijou precis ?",
        name: 'Nom',
        fullName: 'Nom complet',
        phone: 'Telephone',
        email: 'Email',
        message: 'Message',
        send: 'Envoyer',
        yourCart: 'Votre panier',
        close: 'Fermer',
        deliveryAddress: 'Adresse de livraison',
        total: 'Total',
        order: 'Commander',
        footerNote: "Prix affiches en FCFA pour la Cote d'Ivoire.",
        noProducts: 'Aucun produit disponible dans cette categorie.',
        reviews: 'avis',
        fastDelivery: 'Livraison rapide a Abidjan',
        stock: 'en stock',
        viewDetails: 'Voir details',
        addToCart: 'Ajouter au panier',
        previous: 'Precedent',
        next: 'Suivant',
        resultIn: 'resultat(s) dans',
        allCategoriesLower: 'toutes les categories',
        pageHelp: 'utilisez Suivant ou les numeros pour changer de page.',
        jewelryLower: 'bijoux',
        rating: '4,7 sur 5',
        priceNote: "Prix affiche en FCFA pour la Cote d'Ivoire.",
        checkedBeforeDelivery: 'Produit controle avant livraison.',
        returnPossible: 'Retour possible si la taille ne convient pas.',
        stockAvailable: 'Stock disponible',
        piece: 'piece(s).',
        deliveryAvailable: "Livraison disponible a Abidjan et en Cote d'Ivoire",
        outOfStock: 'Rupture de stock',
        quantity: 'Quantite',
        buyNow: 'Acheter maintenant',
        related: 'Articles similaires',
        noRelated: 'Aucun autre article pour le moment.',
        emptyCart: 'Votre panier est vide.',
        removeOne: 'Retirer une unite',
        addOne: 'Ajouter une unite',
        removeFromCart: 'Retirer du panier',
        loadingOrder: 'Enregistrement...',
        loadingContact: 'Envoi...',
        requiredOrder: 'Nom et telephone obligatoires pour valider la commande.',
        orderError: "Impossible d'envoyer la commande.",
        orderSuccess: 'Commande enregistree. Nous vous contacterons pour la confirmation.',
        contactError: "Impossible d'envoyer le message.",
        contactSuccess: 'Message enregistre avec succes.',
        categoriesError: 'Impossible de charger les categories.',
        productsError: 'Impossible de charger les produits.',
        languageChanged: 'Application en francais.',
        addedToCart: 'ajoute au panier.',
        menuOpen: 'Ouvrir le menu',
        cartOpen: 'Ouvrir le panier',
        detailClose: 'Fermer le detail',
        cartClose: 'Fermer le panier',
        pageTitle: 'Maison Eclat Bijoux | Colliers, montres et bracelets'
    },
    en: {
        languageLabel: 'Language',
        deliverTo: 'Deliver to',
        hello: 'Hello',
        signIn: 'Sign in',
        adminTop: 'Admin',
        adminBottom: 'dashboard',
        cart: 'Cart',
        searchPlaceholder: 'Search a product',
        search: 'Search',
        allShort: 'All',
        allCategories: 'All categories',
        navAll: 'All',
        flashSales: 'Flash Sales',
        bestSales: 'Best sellers',
        newItems: 'New arrivals',
        customerService: 'Customer service',
        heroEyebrow: 'Jewelry collection in Abidjan',
        heroTitle: 'Jewelry shine, watch style',
        heroText: 'Bright necklaces, elegant chains, bracelets, rings, earrings and premium watches with clear FCFA prices.',
        exploreCollection: 'Explore the collection',
        newProducts: 'New arrivals',
        productPrices: 'Product prices',
        fromPrice: 'from 9,000 FCFA',
        securePayment: 'Secure payment',
        simpleOrder: 'simple and fast order',
        returns: '14-day returns',
        returnHelp: 'if the size is not right',
        home: 'Home',
        jewelry: 'Jewelry',
        breadcrumbCurrent: 'Necklaces, bracelets and watches',
        products: 'products',
        pages: 'pages',
        categories: 'categories',
        sortBy: 'Sort by',
        featured: 'Relevance',
        priceAsc: 'Price: low to high',
        priceDesc: 'Price: high to low',
        stockDesc: 'Best stock',
        refineBy: 'Refine by',
        department: 'Department',
        price: 'Price',
        minFcfa: 'Minimum FCFA',
        maxFcfa: 'Maximum FCFA',
        availability: 'Availability',
        inStockOnly: 'Show only items in stock',
        resultsFor: 'Results for',
        browseHelp: 'Browse jewelry and watches by page to quickly find the model you want.',
        commitments: 'Our commitments',
        commitmentTitle: 'Jewelry chosen with care',
        commitmentText: 'Discover an elegant selection of necklaces, chains, bracelets, rings, earrings and watches for gifts or personal style.',
        presentedTitle: 'Clear product pages',
        presentedText: 'Each model shows its photo, FCFA price and useful details to help you choose easily.',
        simpleBuyTitle: 'Simple shopping',
        simpleBuyText: 'Add jewelry to your cart, change quantities and prepare your order in a few clicks.',
        comfortTitle: 'Comfort everywhere',
        comfortText: 'The shop stays pleasant to use on phone, tablet and computer.',
        contactEyebrow: 'Contact',
        contactTitle: 'Need a specific piece?',
        name: 'Name',
        fullName: 'Full name',
        phone: 'Phone',
        email: 'Email',
        message: 'Message',
        send: 'Send',
        yourCart: 'Your cart',
        close: 'Close',
        deliveryAddress: 'Delivery address',
        total: 'Total',
        order: 'Order',
        footerNote: 'Prices are shown in FCFA for Ivory Coast.',
        noProducts: 'No products available in this category.',
        reviews: 'reviews',
        fastDelivery: 'Fast delivery in Abidjan',
        stock: 'in stock',
        viewDetails: 'View details',
        addToCart: 'Add to cart',
        previous: 'Previous',
        next: 'Next',
        resultIn: 'result(s) in',
        allCategoriesLower: 'all categories',
        pageHelp: 'use Next or the numbers to change page.',
        jewelryLower: 'jewelry',
        rating: '4.7 out of 5',
        priceNote: 'Price shown in FCFA for Ivory Coast.',
        checkedBeforeDelivery: 'Product checked before delivery.',
        returnPossible: 'Return possible if the size is not right.',
        stockAvailable: 'Available stock',
        piece: 'piece(s).',
        deliveryAvailable: 'Delivery available in Abidjan and Ivory Coast',
        outOfStock: 'Out of stock',
        quantity: 'Quantity',
        buyNow: 'Buy now',
        related: 'Similar items',
        noRelated: 'No other item for now.',
        emptyCart: 'Your cart is empty.',
        removeOne: 'Remove one unit',
        addOne: 'Add one unit',
        removeFromCart: 'Remove from cart',
        loadingOrder: 'Saving...',
        loadingContact: 'Sending...',
        requiredOrder: 'Name and phone are required to confirm the order.',
        orderError: 'Unable to send the order.',
        orderSuccess: 'Order saved. We will contact you to confirm it.',
        contactError: 'Unable to send the message.',
        contactSuccess: 'Message saved successfully.',
        categoriesError: 'Unable to load categories.',
        productsError: 'Unable to load products.',
        languageChanged: 'Language changed to English.',
        addedToCart: 'added to cart.',
        menuOpen: 'Open menu',
        cartOpen: 'Open cart',
        detailClose: 'Close details',
        cartClose: 'Close cart',
        pageTitle: 'Maison Eclat Bijoux | Necklaces, watches and bracelets',
        authSignIn: 'Sign in',
        authRegister: 'Create account',
        authEmail: 'Email',
        authPassword: 'Password',
        authFullName: 'Full name',
        authPhone: 'Phone number',
        authConfirmPassword: 'Confirm password',
        authLoginButton: 'Sign in',
        authRegisterButton: 'Create account',
        authLoginError: 'Login failed. Check your credentials.',
        authRegisterError: 'Registration failed. Email may already be used.',
        authSuccess: 'Success!',
        authLogout: 'Sign out',
        authMyAccount: 'My account'
    }
};

const categoryTranslations = {
    Montres: 'Watches',
    Bracelets: 'Bracelets',
    Bagues: 'Rings',
    Boucles: 'Earrings',
    Coffrets: 'Gift boxes',
    Pendentifs: 'Pendants',
    'Plaque or': 'Gold plated',
    'Argent 925': 'Sterling silver',
    Chaines: 'Chains',
    Colliers: 'Necklaces',
    'Sacs femme': "Women's bags",
    'Accessoires femme': "Women's accessories",
    'Accessoires homme': "Men's accessories",
    Parfums: 'Perfumes',
    Lunettes: 'Glasses',
    Portefeuilles: 'Wallets',
    Ceintures: 'Belts',
    Casquettes: 'Caps',
    'Soins et beaute': 'Beauty care'
};

const priceFormatter = new Intl.NumberFormat('fr-CI', {
    style: 'currency',
    currency: 'XOF',
    maximumFractionDigits: 0
});

function t(key) {
    return translations[currentLanguage][key] || translations.fr[key] || key;
}

function isEnglish() {
    return currentLanguage === 'en';
}

function categoryLabel(category) {
    return isEnglish() ? (categoryTranslations[category] || category) : category;
}

function productNameLabel(name) {
    if (!isEnglish()) return name;

    const replacements = [
        ['Collier', 'Necklace'],
        ['Bracelet', 'Bracelet'],
        ['Bague', 'Ring'],
        ['Boucles', 'Earrings'],
        ['Montre', 'Watch'],
        ['Coffret', 'Gift box'],
        ['chaine', 'chain'],
        ['chaîne', 'chain'],
        ['chaines', 'chains'],
        ['argentee', 'silver'],
        ['argente', 'silver'],
        ['argent', 'silver'],
        ['doree', 'gold'],
        ['dore', 'gold'],
        ['dorure', 'gold finish'],
        ['plaque or', 'gold plated'],
        ['acier', 'steel'],
        ['cuir', 'leather'],
        ['homme', "men's"],
        ['femme', "women's"],
        ['coeur', 'heart'],
        ['croix', 'cross'],
        ['perles', 'pearls'],
        ['perle', 'pearl'],
        ['noires', 'black'],
        ['noire', 'black'],
        ['noir', 'black'],
        ['blanches', 'white'],
        ['blanche', 'white'],
        ['blanc', 'white'],
        ['fine', 'slim'],
        ['fin', 'slim'],
        ['classique', 'classic'],
        ['brillant', 'shiny'],
        ['brillante', 'shiny'],
        ['luxe', 'luxury'],
        ['cadeau', 'gift'],
        ['pendentif', 'pendant'],
        ['rond', 'round'],
        ['ronde', 'round'],
        ['double rang', 'double row'],
        ['maille', 'link'],
        ['gourmette', 'curb'],
        ['pierre', 'stone'],
        ['etoile', 'star'],
        ['lune', 'moon'],
        ['soleil', 'sun'],
        ['ceremonie', 'ceremony'],
        ['bijou', 'jewelry'],
        ['bijoux', 'jewelry']
    ];

    return replacements.reduce((label, [from, to]) => {
        return label.replace(new RegExp(from, 'gi'), to);
    }, name);
}

function productDescriptionLabel(product) {
    if (!isEnglish()) return product.description;
    return `${categoryLabel(product.categorie)} with a polished finish, selected for everyday wear, gifts and dressed-up occasions.`;
}

function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element) {
        element.textContent = value;
    }
}

function setAllText(selector, values) {
    document.querySelectorAll(selector).forEach((element, index) => {
        if (values[index] !== undefined) {
            element.textContent = values[index];
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupHeroImageFallback();
    setupLanguageSwitcher();
    initializeSearchFromInput();
    loadCategories();
    loadProducts();
    setupEventListeners();
    updateCartUI();
});

function setupLanguageSwitcher() {
    const tabs = document.getElementById('language-tabs');
    if (!tabs) return;

    const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
    const supportedLanguages = ['fr', 'en', 'ar', 'es', 'de', 'pt'];
    currentLanguage = supportedLanguages.includes(savedLanguage) ? savedLanguage : 'fr';
    updateLanguageTabs(currentLanguage);
    applyLanguage(currentLanguage, false);

    tabs.addEventListener('change', (event) => {
        if (event.target.id !== 'language-select') return;

        const language = event.target.value || 'fr';
        const supportedLanguages = ['fr', 'en', 'ar', 'es', 'de', 'pt'];
        currentLanguage = supportedLanguages.includes(language) ? language : 'fr';
        localStorage.setItem('preferredLanguage', currentLanguage);
        updateLanguageTabs(currentLanguage);
        applyLanguage(currentLanguage, true);
    });
}

function updateLanguageTabs(language) {
    const select = document.getElementById('language-select');
    if (select) select.value = language;
}

function applyLanguage(language, notify = false) {
    const supportedLanguages = ['fr', 'en', 'ar', 'es', 'de', 'pt'];
    currentLanguage = supportedLanguages.includes(language) ? language : 'fr';
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = currentLanguage === 'ar' ? 'rtl' : 'ltr';
    document.title = t('pageTitle');

    setText('.language-switcher span', t('languageLabel'));
    document.querySelector('.language-switcher')?.setAttribute('aria-label', t('languageLabel'));
    setText('.delivery-link span', t('deliverTo'));
    setText('.account-links a[href="#contact"] span', t('hello'));
    setText('.account-links a[href="#contact"] strong', t('signIn'));
    setText('.account-links a[href="/admin/orders"] span', t('adminTop'));
    setText('.account-links a[href="/admin/orders"] strong', t('adminBottom'));
    setText('.cart-text', t('cart'));
    setText('#search-form button', t('search'));
    setText('#cart-title', t('yourCart'));
    setText('.close-cart', t('close'));
    setText('.close-product', t('close'));
    setText('#checkout-button', t('order'));
    setText('.hero .eyebrow', t('heroEyebrow'));
    setText('.hero h1', t('heroTitle'));
    setText('.hero-content > p:not(.eyebrow)', t('heroText'));
    setAllText('.hero-highlights span', [categoryLabel('Colliers'), categoryLabel('Bracelets'), categoryLabel('Bagues'), categoryLabel('Montres')]);
    setAllText('.hero-actions a', [t('exploreCollection'), t('newProducts')]);
    setAllText('.strip strong', [t('productPrices'), t('securePayment'), t('returns')]);
    setAllText('.strip span', [t('fromPrice'), t('simpleOrder'), t('returnHelp')]);
    setAllText('.breadcrumbs a', [t('home'), t('jewelry')]);
    setText('.breadcrumbs strong', t('breadcrumbCurrent'));
    setText('.sort-control span', t('sortBy'));
    setText('.filters-panel h2', t('refineBy'));
    setAllText('.filter-group h3', [t('department'), t('price'), t('availability')]);
    setAllText('.filter-group label span', [t('minFcfa'), t('maxFcfa'), t('inStockOnly')]);
    const resultsTitle = document.querySelector('.results-heading h1');
    if (resultsTitle) {
        resultsTitle.innerHTML = `${t('resultsFor')} <span id="query-label">${searchQuery || categoryLabel(selectedCategory) || t('jewelryLower')}</span>`;
    }
    setText('.results-heading p', t('browseHelp'));
    setText('.commitment-text .eyebrow', t('commitments'));
    setText('.commitment-text h2', t('commitmentTitle'));
    setText('.commitment-text > p:not(.eyebrow)', t('commitmentText'));
    setAllText('.commitment-grid h3', [t('presentedTitle'), t('simpleBuyTitle'), t('comfortTitle')]);
    setAllText('.commitment-grid p', [t('presentedText'), t('simpleBuyText'), t('comfortText')]);
    setText('.contact-section .eyebrow', t('contactEyebrow'));
    setText('.contact-section h2', t('contactTitle'));
    setAllText('#contact-form label span', [t('name'), t('email'), t('message')]);
    setText('#contact-form button', t('send'));
    setAllText('#checkout-form label span', [t('fullName'), t('phone'), t('email'), t('deliveryAddress')]);
    setText('.cart-total-row span', t('total'));
    setAllText('.footer p', ['Maison Eclat Bijoux', t('footerNote')]);

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = t('searchPlaceholder');
    const searchCategoryFirst = document.querySelector('#search-category option:first-child');
    if (searchCategoryFirst) searchCategoryFirst.textContent = t('allShort');
    const categoryFilterFirst = document.querySelector('#category-filter option:first-child');
    if (categoryFilterFirst) categoryFilterFirst.textContent = t('allCategories');
    setAllText('#sort-select option', [t('featured'), t('priceAsc'), t('priceDesc'), t('stockDesc')]);
    setAllText('.nav-links a', [
        t('navAll'),
        t('flashSales'),
        t('bestSales'),
        t('newItems'),
        categoryLabel('Colliers'),
        categoryLabel('Bracelets'),
        t('customerService')
    ]);
    document.querySelectorAll('[data-quick-category]').forEach((button) => {
        button.textContent = categoryLabel(button.dataset.quickCategory);
    });
    document.querySelector('.menu-button')?.setAttribute('aria-label', t('menuOpen'));
    document.querySelector('.cart-button')?.setAttribute('aria-label', t('cartOpen'));
    document.querySelector('.close-product')?.setAttribute('aria-label', t('detailClose'));
    document.querySelector('.close-cart')?.setAttribute('aria-label', t('cartClose'));

    displayCategories();
    populateCategoryFilter();
    displayProducts(getCurrentPageProducts(products));
    renderPagination(getTotalPages(products.length));
    updateResultsSummary();
    updateCartUI();

    const productModal = document.getElementById('product-modal');
    const openProductId = Number(productModal?.dataset.productId || 0);
    if (productModal?.classList.contains('open') && openProductId) {
        openProductDetail(openProductId);
    }

    if (notify) {
        showNotification(t('languageChanged'));
    }
}

function initializeSearchFromInput() {
    const searchInput = document.getElementById('search-input');
    searchQuery = searchInput ? searchInput.value.trim().toLowerCase() : '';
}

function setupHeroImageFallback() {
    const heroImage = document.querySelector('.hero-photo img');
    if (!heroImage) return;

    heroImage.onerror = () => {
        heroImage.onerror = null;
        heroImage.src = 'assets/hero-bijoux.svg';
    };
}

function setupEventListeners() {
    document.getElementById('category-filter').addEventListener('change', (event) => {
        filterByCategory(event.target.value);
    });

    document.getElementById('search-category').addEventListener('change', (event) => {
        filterByCategory(event.target.value);
    });

    document.getElementById('search-input').addEventListener('input', (event) => {
        searchQuery = event.target.value.trim().toLowerCase();
        currentPage = 1;
        applyProductFilters();
    });

    document.getElementById('sort-select').addEventListener('change', (event) => {
        sortMode = event.target.value;
        currentPage = 1;
        applyProductFilters();
    });

    document.getElementById('price-min').addEventListener('input', (event) => {
        minimumPrice = event.target.value;
        currentPage = 1;
        applyProductFilters();
    });

    document.getElementById('price-max').addEventListener('input', (event) => {
        maximumPrice = event.target.value;
        currentPage = 1;
        applyProductFilters();
    });

    document.getElementById('available-only').addEventListener('change', (event) => {
        availableOnly = event.target.checked;
        currentPage = 1;
        applyProductFilters();
    });

    document.getElementById('search-form').addEventListener('submit', (event) => {
        event.preventDefault();
        document.getElementById('produits').scrollIntoView({ behavior: 'smooth' });
        applyProductFilters();
    });

    document.getElementById('contact-form').addEventListener('submit', handleContactForm);
    document.querySelector('.cart-button').addEventListener('click', openCart);
    document.querySelector('.close-cart').addEventListener('click', closeCart);
    document.querySelector('.close-product').addEventListener('click', closeProductDetail);
    document.getElementById('checkout-form').addEventListener('submit', checkout);

    const menuButton = document.querySelector('.menu-button');
    menuButton.addEventListener('click', toggleMobileMenu);

    document.querySelectorAll('.nav-links a').forEach((link) => {
        link.addEventListener('click', handleNavigationLink);
    });

    document.querySelectorAll('[data-quick-category]').forEach((button) => {
        button.addEventListener('click', () => {
            filterByCategory(button.dataset.quickCategory || '');
            document.getElementById('produits').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    document.getElementById('cart-modal').addEventListener('click', (event) => {
        if (event.target.id === 'cart-modal') {
            closeCart();
        }
    });

    document.getElementById('product-modal').addEventListener('click', (event) => {
        if (event.target.id === 'product-modal') {
            closeProductDetail();
        }
    });
}

async function loadCategories() {
    try {
        const response = await fetch('/api/categories');
        categories = await response.json();
        displayCategories();
        populateCategoryFilter();
        updateNavigationState();
    } catch (error) {
        showNotification(t('categoriesError'));
    }
}

async function loadProducts(category = '') {
    try {
        const url = category ? `/api/produits/${encodeURIComponent(category)}` : '/api/produits';
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Erreur HTTP ${response.status}`);
        }
        allProducts = await response.json();
        if (!Array.isArray(allProducts)) {
            throw new Error('Reponse produits invalide');
        }
        applyProductFilters();
    } catch (error) {
        console.error('Erreur de chargement des produits:', error);
        showNotification(t('productsError'));
    }
}

function displayCategories() {
    const container = document.getElementById('categories-container');
    container.innerHTML = '';

    const allButton = createCategoryButton(t('allShort'), '');
    container.appendChild(allButton);

    categories.forEach((category) => {
        container.appendChild(createCategoryButton(categoryLabel(category), category));
    });
}

function createCategoryButton(label, value) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `category-chip${selectedCategory === value ? ' active' : ''}`;
    button.textContent = label;
    button.addEventListener('click', () => filterByCategory(value));
    return button;
}

function populateCategoryFilter() {
    const filter = document.getElementById('category-filter');
    const searchFilter = document.getElementById('search-category');
    filter.querySelectorAll('option:not(:first-child)').forEach((option) => option.remove());
    searchFilter.querySelectorAll('option:not(:first-child)').forEach((option) => option.remove());

    categories.forEach((category) => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = categoryLabel(category);
        filter.appendChild(option);

        const searchOption = document.createElement('option');
        searchOption.value = category;
        searchOption.textContent = categoryLabel(category);
        searchFilter.appendChild(searchOption);
    });
}

function applyProductFilters() {
    products = allProducts.filter((product) => {
        const searchableText = `${product.nom} ${product.description} ${product.categorie}`.toLowerCase();
        const productPrice = Number(product.prix) || 0;
        const min = minimumPrice === '' ? null : Number(minimumPrice);
        const max = maximumPrice === '' ? null : Number(maximumPrice);
        const matchesSearch = !searchQuery || searchableText.includes(searchQuery);
        const matchesMin = min === null || productPrice >= min;
        const matchesMax = max === null || productPrice <= max;
        const matchesStock = !availableOnly || Number(product.stock) > 0;

        return matchesSearch && matchesMin && matchesMax && matchesStock;
    });

    products = sortProducts(products);

    const totalPages = getTotalPages(products.length);
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }

    displayProducts(getCurrentPageProducts(products));
    renderPagination(totalPages);
    updateResultsSummary();
}

function sortProducts(items) {
    const sorted = [...items];

    if (sortMode === 'price-asc') {
        sorted.sort((a, b) => Number(a.prix) - Number(b.prix));
    } else if (sortMode === 'price-desc') {
        sorted.sort((a, b) => Number(b.prix) - Number(a.prix));
    } else if (sortMode === 'stock-desc') {
        sorted.sort((a, b) => Number(b.stock) - Number(a.stock));
    } else if (sortMode === 'newest') {
        sorted.sort((a, b) => Number(b.id) - Number(a.id));
    }

    return sorted;
}

function displayProducts(productsToDisplay) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    if (productsToDisplay.length === 0) {
        container.innerHTML = `<p class="empty-cart">${t('noProducts')}</p>`;
        renderPagination(1);
        return;
    }

    productsToDisplay.forEach((product) => {
        const article = document.createElement('article');
        article.className = 'product-card';
        article.tabIndex = 0;
        article.innerHTML = `
            <div class="product-image-wrap">
                <img src="${product.image}" alt="${productNameLabel(product.nom)}" loading="lazy" decoding="async">
            </div>
            <div class="product-body">
                <span class="sponsored-label">${categoryLabel(product.categorie)}</span>
                <h3>${productNameLabel(product.nom)}</h3>
                <div class="product-rating">${createStars(product.id)} <span>${getReviewCount(product.id)} ${t('reviews')}</span></div>
                <p class="product-description">${productDescriptionLabel(product)}</p>
                <div class="product-meta">
                    <span class="price">${formatPrice(product.prix)}</span>
                    <span class="delivery-note">${t('fastDelivery')}</span>
                    <span class="product-stock">${product.stock} ${t('stock')}</span>
                </div>
                <div class="product-actions">
                    <button class="button secondary detail-button" type="button" data-product-id="${product.id}">${t('viewDetails')}</button>
                    <button class="button primary add-cart-button" type="button" data-product-id="${product.id}">${t('addToCart')}</button>
                </div>
            </div>
        `;

        const image = article.querySelector('img');
        // Disabled fallback to show real Pexels jewelry images with shine
        // attachProductImageFallback(image, product);

        article.addEventListener('click', () => openProductDetail(product.id));
        article.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                openProductDetail(product.id);
            }
        });

        article.querySelector('.detail-button').addEventListener('click', (event) => {
            event.stopPropagation();
            openProductDetail(product.id);
        });

        article.querySelector('.add-cart-button').addEventListener('click', (event) => {
            event.stopPropagation();
            addToCart(product.id);
        });
        container.appendChild(article);
    });
}

function getTotalPages(totalProducts) {
    return Math.max(1, Math.ceil(totalProducts / productsPerPage));
}

function getCurrentPageProducts(items) {
    const start = (currentPage - 1) * productsPerPage;
    return items.slice(start, start + productsPerPage);
}

function renderPagination(totalPages) {
    const containers = [
        document.getElementById('pagination-bottom')
    ];

    containers.forEach((container) => {
        if (!container) return;
        container.innerHTML = '';

        if (products.length === 0) {
            return;
        }

        const previous = createPageButton(t('previous'), currentPage - 1, currentPage === 1);
        container.appendChild(previous);

        for (let page = 1; page <= totalPages; page += 1) {
            const button = createPageButton(String(page), page, false);
            if (page === currentPage) {
                button.classList.add('active');
                button.setAttribute('aria-current', 'page');
            }
            container.appendChild(button);
        }

        const next = createPageButton(t('next'), currentPage + 1, currentPage === totalPages);
        container.appendChild(next);
    });
}

function createPageButton(label, page, disabled) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'page-button';
    button.textContent = label;
    button.disabled = disabled;
    button.addEventListener('click', () => {
        if (disabled) return;
        currentPage = page;
        displayProducts(getCurrentPageProducts(products));
        renderPagination(getTotalPages(products.length));
        updateResultsSummary();
        document.getElementById('produits').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    return button;
}

function openProductDetail(productId) {
    const product = allProducts.find((item) => item.id === productId) || products.find((item) => item.id === productId);
    if (!product) return;
    const relatedProducts = getRelatedProducts(product);

    const detail = document.getElementById('product-detail-content');
    detail.innerHTML = `
        <div class="detail-media">
            <img class="detail-image" src="${product.image}" alt="${productNameLabel(product.nom)}" decoding="async">
        </div>
        <div class="detail-main">
            <p class="eyebrow">${categoryLabel(product.categorie)}</p>
            <h2 id="detail-title">${productNameLabel(product.nom)}</h2>
            <div class="detail-rating">★★★★★ <span>${t('rating')}</span></div>
            <p class="detail-description">${productDescriptionLabel(product)}</p>
            <ul class="detail-list">
                <li>${t('priceNote')}</li>
                <li>${t('checkedBeforeDelivery')}</li>
                <li>${t('returnPossible')}</li>
                <li>${t('stockAvailable')}: ${product.stock} ${t('piece')}</li>
            </ul>
        </div>
        <aside class="buy-box">
            <span class="price">${formatPrice(product.prix)}</span>
            <span class="delivery-note">${t('deliveryAvailable')}</span>
            <span>${product.stock > 0 ? t('stock') : t('outOfStock')}</span>
            <label class="detail-quantity">
                <span>${t('quantity')}</span>
                <select id="detail-quantity">
                    ${createQuantityOptions(product.stock)}
                </select>
            </label>
            <button class="button primary" type="button" id="detail-add-cart">${t('addToCart')}</button>
            <button class="button primary" type="button" id="detail-buy-now">${t('buyNow')}</button>
        </aside>
        <section class="related-products" aria-label="${t('related')}">
            <div class="related-heading">
                <h3>${t('related')}</h3>
                <span>${categoryLabel(product.categorie)}</span>
            </div>
            <div class="related-grid">
                ${createRelatedProductCards(relatedProducts)}
            </div>
        </section>
    `;

    const detailImage = detail.querySelector('.detail-image');
    // Disabled fallback to show real Pexels jewelry images with shine
    // attachProductImageFallback(detailImage, product);
    detail.querySelectorAll('.related-card').forEach((card) => {
        const relatedId = Number(card.dataset.productId);
        const relatedProduct = allProducts.find((item) => item.id === relatedId) || products.find((item) => item.id === relatedId);
        const image = card.querySelector('img');

        if (relatedProduct && image) {
            // Disabled fallback to show real Pexels jewelry images with shine
            // attachProductImageFallback(image, relatedProduct);
        }

        card.addEventListener('click', () => openProductDetail(relatedId));
    });

    document.getElementById('detail-add-cart').addEventListener('click', () => {
        addToCart(product.id, getDetailQuantity());
        closeProductDetail();
    });

    document.getElementById('detail-buy-now').addEventListener('click', () => {
        addToCart(product.id, getDetailQuantity());
        closeProductDetail();
        openCart();
    });

    const modal = document.getElementById('product-modal');
    modal.dataset.productId = String(product.id);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function getRelatedProducts(product) {
    const source = allProducts.length > 0 ? allProducts : products;
    return source
        .filter((item) => item.id !== product.id && item.categorie === product.categorie)
        .slice(0, 6);
}

function createRelatedProductCards(items) {
    if (items.length === 0) {
        return `<p class="empty-related">${t('noRelated')}</p>`;
    }

    return items.map((item) => `
        <button class="related-card" type="button" data-product-id="${item.id}">
            <img src="${item.image}" alt="${productNameLabel(item.nom)}" loading="lazy" decoding="async">
            <span>${productNameLabel(item.nom)}</span>
            <strong>${formatPrice(item.prix)}</strong>
        </button>
    `).join('');
}

function closeProductDetail() {
    const modal = document.getElementById('product-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modal.dataset.productId = '';
}

function createQuantityOptions(stock) {
    const max = Math.max(1, Math.min(Number(stock) || 1, 10));
    let options = '';
    for (let quantity = 1; quantity <= max; quantity += 1) {
        options += `<option value="${quantity}">${quantity}</option>`;
    }
    return options;
}

function getDetailQuantity() {
    const select = document.getElementById('detail-quantity');
    return select ? Number(select.value) : 1;
}

function filterByCategory(category) {
    selectedCategory = category;
    activeNavAction = category ? `category:${category}` : 'all';
    currentPage = 1;
    document.getElementById('category-filter').value = category;
    document.getElementById('search-category').value = category;
    displayCategories();
    updateNavigationState();
    loadProducts(category);
}

function handleNavigationLink(event) {
    const action = event.currentTarget.dataset.navAction;
    if (!action) {
        closeMobileMenu();
        return;
    }

    event.preventDefault();
    const category = event.currentTarget.dataset.category || '';
    applyNavigationAction(action, category);
    closeMobileMenu();
    document.getElementById('produits').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function applyNavigationAction(action, category = '') {
    searchQuery = '';
    minimumPrice = '';
    maximumPrice = '';
    availableOnly = false;
    sortMode = 'featured';
    currentPage = 1;

    if (action === 'flash') {
        maximumPrice = '20000';
        sortMode = 'price-asc';
        selectedCategory = '';
        activeNavAction = 'flash';
    } else if (action === 'best') {
        availableOnly = true;
        sortMode = 'stock-desc';
        selectedCategory = '';
        activeNavAction = 'best';
    } else if (action === 'new') {
        sortMode = 'newest';
        selectedCategory = '';
        activeNavAction = 'new';
    } else if (action === 'category') {
        selectedCategory = category;
        activeNavAction = `category:${category}`;
    } else {
        selectedCategory = '';
        activeNavAction = 'all';
    }

    syncFilterControls();
    displayCategories();
    updateNavigationState();
    loadProducts(selectedCategory);
}

function syncFilterControls() {
    document.getElementById('search-input').value = searchQuery;
    document.getElementById('price-min').value = minimumPrice;
    document.getElementById('price-max').value = maximumPrice;
    document.getElementById('available-only').checked = availableOnly;
    document.getElementById('category-filter').value = selectedCategory;
    document.getElementById('search-category').value = selectedCategory;

    const sortSelect = document.getElementById('sort-select');
    sortSelect.value = ['featured', 'price-asc', 'price-desc', 'stock-desc'].includes(sortMode) ? sortMode : 'featured';
}

function updateNavigationState() {
    document.querySelectorAll('.nav-links a[data-nav-action]').forEach((link) => {
        const action = link.dataset.navAction;
        const category = link.dataset.category || '';
        const key = action === 'category' ? `category:${category}` : action;
        link.classList.toggle('active', key === activeNavAction);
    });
}

function updateResultsSummary() {
    const summary = document.getElementById('results-summary');
    const pageSummary = document.getElementById('page-summary');
    const queryLabel = document.getElementById('query-label');
    const catalogCount = document.getElementById('catalog-count');
    const catalogPages = document.getElementById('catalog-pages');
    const catalogCategories = document.getElementById('catalog-categories');
    const categoryText = selectedCategory ? categoryLabel(selectedCategory) : t('allCategoriesLower');
    const searchText = searchQuery ? ` pour "${searchQuery}"` : '';
    const totalPages = getTotalPages(products.length);
    const start = products.length === 0 ? 0 : (currentPage - 1) * productsPerPage + 1;
    const end = Math.min(currentPage * productsPerPage, products.length);

    summary.textContent = `${start}-${end} ${isEnglish() ? 'of' : 'sur'} ${products.length} ${t('resultIn')} ${categoryText}${searchText}`;
    if (pageSummary) {
        pageSummary.textContent = `Page ${currentPage} ${isEnglish() ? 'of' : 'sur'} ${totalPages} - ${t('pageHelp')}`;
    }
    if (queryLabel) {
        queryLabel.textContent = searchQuery || categoryLabel(selectedCategory) || t('jewelryLower');
    }
    if (catalogCount?.parentElement) catalogCount.parentElement.innerHTML = `<strong id="catalog-count">${products.length}</strong> ${t('products')}`;
    if (catalogPages?.parentElement) catalogPages.parentElement.innerHTML = `<strong id="catalog-pages">${totalPages}</strong> ${t('pages')}`;
    if (catalogCategories?.parentElement) catalogCategories.parentElement.innerHTML = `<strong id="catalog-categories">${categories.length}</strong> ${t('categories')}`;
}

function createStars(productId) {
    const filled = 4 + (Number(productId) % 2);
    return '★★★★★'.slice(0, filled) + '☆☆☆☆☆'.slice(0, 5 - filled);
}

function getReviewCount(productId) {
    return 35 + ((Number(productId) || 1) * 17) % 460;
}

function addToCart(productId, quantity = 1) {
    const product = allProducts.find((item) => item.id === productId) || products.find((item) => item.id === productId);
    if (!product) return;

    const existingItem = cart.find((item) => item.id === productId);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ ...product, quantity });
    }

    updateCartUI();
    showNotification(`${productNameLabel(product.nom)} ${t('addedToCart')}`);
}

function updateCartUI() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    updateCartModal();
}

function updateCartModal() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');

    if (cart.length === 0) {
        cartItems.innerHTML = `<p class="empty-cart">${t('emptyCart')}</p>`;
        cartTotal.textContent = formatPrice(0);
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach((item) => {
        const subtotal = item.prix * item.quantity;
        total += subtotal;

        const row = document.createElement('div');
        row.className = 'cart-line';
        row.innerHTML = `
            <div class="cart-line-image">
                <img src="${item.image || item.thumbnail || '/assets/default-product.png'}" alt="${productNameLabel(item.nom)}">
            </div>
            <div class="cart-line-info">
                <strong>${productNameLabel(item.nom)}</strong>
                ${item.categorie ? `<span class="cart-line-meta">${item.categorie}</span>` : ''}
                <span class="cart-line-price">${formatPrice(item.prix)} x ${item.quantity} = ${formatPrice(subtotal)}</span>
            </div>
            <div class="cart-line-actions">
                <div class="cart-controls">
                    <button class="quantity-button" type="button" aria-label="${t('removeOne')}">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-button" type="button" aria-label="${t('addOne')}">+</button>
                </div>
                <button class="remove-button" type="button" aria-label="${t('removeFromCart')}">Supprimer</button>
            </div>
        `;

        const buttons = row.querySelectorAll('button');
        buttons[0].addEventListener('click', () => updateQuantity(item.id, -1));
        buttons[1].addEventListener('click', () => updateQuantity(item.id, 1));
        buttons[2].addEventListener('click', () => removeFromCart(item.id));

        cartItems.appendChild(row);
    });

    cartTotal.textContent = formatPrice(total);
}

function updateQuantity(productId, change) {
    const item = cart.find((cartItem) => cartItem.id === productId);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    updateCartUI();
}

function removeFromCart(productId) {
    cart = cart.filter((item) => item.id !== productId);
    updateCartUI();
}

function openCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeCart() {
    const modal = document.getElementById('cart-modal');
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
}

async function checkout(event) {
    event.preventDefault();

    if (cart.length === 0) {
        showNotification(t('emptyCart'));
        return;
    }

    const form = event.currentTarget;
    const submitButton = document.getElementById('checkout-button');
    const previousText = submitButton.textContent;
    const formData = new FormData(form);
    const customerName = String(formData.get('customerName') || '').trim();
    const customerPhone = String(formData.get('customerPhone') || '').trim();
    const customerEmail = String(formData.get('customerEmail') || '').trim();
    const customerAddress = String(formData.get('customerAddress') || '').trim();

    if (!customerName || !customerPhone) {
        showNotification(t('requiredOrder'));
        return;
    }

    try {
        submitButton.disabled = true;
        submitButton.textContent = t('loadingOrder');

        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                customerName,
                customerPhone,
                customerEmail,
                customerAddress,
                items: cart.map((item) => ({
                    id: item.id,
                    nom: item.nom,
                    prix: item.prix,
                    quantity: item.quantity
                }))
            })
        });
        const result = await readJsonResponse(response, t('orderError'));

        if (!response.ok) {
            throw new Error(result.error || t('orderError'));
        }

        cart = [];
        updateCartUI();
        form.reset();
        closeCart();
        showNotification(result.message || t('orderSuccess'));
    } catch (error) {
        showNotification(error.message || t('orderError'));
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = previousText;
    }
}

async function handleContactForm(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const submitButton = form.querySelector('button[type="submit"]');
    const previousText = submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent = t('loadingContact');

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nom: formData.get('nom'),
                email: formData.get('email'),
                message: formData.get('message')
            })
        });
        const result = await readJsonResponse(response, t('contactError'));

        if (!response.ok) {
            throw new Error(result.error || t('contactError'));
        }

        form.reset();
        showNotification(result.message || t('contactSuccess'));
    } catch (error) {
        showNotification(error.message || t('contactError'));
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = previousText;
    }
}

function toggleMobileMenu() {
    const links = document.querySelector('.sub-nav');
    const button = document.querySelector('.menu-button');
    const isOpen = links.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
}

function closeMobileMenu() {
    document.querySelector('.sub-nav').classList.remove('open');
    document.querySelector('.menu-button').setAttribute('aria-expanded', 'false');
}

function formatPrice(price) {
    return priceFormatter.format(Number(price));
}

async function readJsonResponse(response, fallbackMessage) {
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
        const data = await response.json();

        if (data && data.error) {
            data.error = friendlyApiError(data.error, fallbackMessage);
        }

        return data;
    }

    const text = await response.text();
    const isApiMissing = response.status === 404 && text.toLowerCase().includes('cannot post');
    const error = new Error(isApiMissing
        ? 'Le formulaire email est envoye vers un ancien serveur. Ouvrez la boutique avec le bon port du serveur Node.'
        : fallbackMessage);
    error.statusCode = response.status;
    throw error;
}

function friendlyApiError(message, fallbackMessage) {
    const text = String(message || '');

    if (/invalid login|badcredentials|535-5\.7\.8|username and password not accepted|smtp|gmail/i.test(text)) {
        return `Email non envoye. Verifiez la configuration Gmail SMTP dans le fichier .env.`;
    }

    return text || fallbackMessage;
}

function setFallbackImage(image, product) {
    image.onerror = null;
    image.src = createFallbackImage(product);
}

function attachProductImageFallback(image, product) {
    let fallbackTimer = window.setTimeout(() => {
        if (!image.complete || image.naturalWidth === 0) {
            setFallbackImage(image, product);
        }
    }, 3200);

    image.addEventListener('load', () => {
        window.clearTimeout(fallbackTimer);
        if (image.naturalWidth === 0) {
            setFallbackImage(image, product);
        }
    }, { once: true });

    image.addEventListener('error', () => {
        window.clearTimeout(fallbackTimer);
        setFallbackImage(image, product);
    }, { once: true });
}

function createFallbackImage(product) {
    const palette = getCategoryPalette(product.categorie);
    const category = escapeXml(product.categorie || 'Produit');
    const name = escapeXml(product.nom || 'Maison Chainee');
    const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
            <defs>
                <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stop-color="${palette.start}"/>
                    <stop offset="1" stop-color="${palette.end}"/>
                </linearGradient>
            </defs>
            <rect width="900" height="900" fill="url(#bg)"/>
            <circle cx="450" cy="360" r="150" fill="none" stroke="${palette.stroke}" stroke-width="34"/>
            <circle cx="450" cy="360" r="92" fill="none" stroke="${palette.light}" stroke-width="18"/>
            <path d="M304 520h292c38 0 70 32 70 70v34H234v-34c0-38 32-70 70-70Z" fill="${palette.light}" opacity="0.9"/>
            <text x="450" y="690" text-anchor="middle" font-family="Arial, sans-serif" font-size="44" font-weight="700" fill="${palette.text}">${category}</text>
            <text x="450" y="752" text-anchor="middle" font-family="Arial, sans-serif" font-size="30" fill="${palette.text}">${name}</text>
            <text x="450" y="820" text-anchor="middle" font-family="Arial, sans-serif" font-size="26" fill="${palette.text}">Maison Chainee</text>
        </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getCategoryPalette(category) {
    const palettes = {
        Montres: { start: '#101820', end: '#455a64', stroke: '#f5c16c', light: '#ffffff', text: '#ffffff' },
        Bracelets: { start: '#352208', end: '#b9782f', stroke: '#fff1c7', light: '#f5c16c', text: '#ffffff' },
        Bagues: { start: '#172026', end: '#607d8b', stroke: '#e7e7e7', light: '#ffffff', text: '#ffffff' },
        Boucles: { start: '#3b2138', end: '#b45f7b', stroke: '#ffe2ed', light: '#ffffff', text: '#ffffff' },
        Coffrets: { start: '#19332c', end: '#2f6b52', stroke: '#f5c16c', light: '#ffffff', text: '#ffffff' },
        Pendentifs: { start: '#221b14', end: '#8a5a2b', stroke: '#f8d58a', light: '#fff7db', text: '#ffffff' },
        'Plaque or': { start: '#2c1d05', end: '#c48a2c', stroke: '#ffe29a', light: '#fff5cf', text: '#ffffff' },
        'Argent 925': { start: '#263238', end: '#90a4ae', stroke: '#ffffff', light: '#eceff1', text: '#ffffff' },
        Chaines: { start: '#1e293b', end: '#64748b', stroke: '#f5c16c', light: '#ffffff', text: '#ffffff' },
        'Sacs femme': { start: '#24151c', end: '#b76e79', stroke: '#ffe3ec', light: '#ffffff', text: '#ffffff' },
        'Accessoires femme': { start: '#2f1f2e', end: '#8f5f85', stroke: '#ffe2f4', light: '#ffffff', text: '#ffffff' },
        'Accessoires homme': { start: '#121826', end: '#475569', stroke: '#f5c16c', light: '#ffffff', text: '#ffffff' },
        Parfums: { start: '#1d2433', end: '#9b7f5f', stroke: '#fff0c2', light: '#ffffff', text: '#ffffff' },
        Lunettes: { start: '#111827', end: '#256d85', stroke: '#f8d58a', light: '#ffffff', text: '#ffffff' },
        Portefeuilles: { start: '#231710', end: '#7c4a2d', stroke: '#f5c16c', light: '#fff7db', text: '#ffffff' },
        Ceintures: { start: '#1c1917', end: '#8b5e34', stroke: '#f8d58a', light: '#fff7db', text: '#ffffff' },
        Casquettes: { start: '#0f172a', end: '#2f7d6d', stroke: '#f5c16c', light: '#ffffff', text: '#ffffff' },
        'Soins et beaute': { start: '#2d2438', end: '#d0826f', stroke: '#ffe6d6', light: '#ffffff', text: '#ffffff' }
    };

    return palettes[category] || palettes.Chaines;
}

function escapeXml(value) {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = friendlyApiError(message, String(message || ''));
    notification.classList.add('show');

    window.clearTimeout(showNotification.timer);
    showNotification.timer = window.setTimeout(() => {
        notification.classList.remove('show');
    }, 5200);
}

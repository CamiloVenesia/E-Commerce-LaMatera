import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addDoc, collection, deleteDoc, deleteField, doc, getDocs, orderBy, query, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { FiCheck, FiChevronLeft, FiChevronRight, FiEdit3, FiImage, FiLogOut, FiMove, FiPackage, FiPlus, FiSearch, FiShoppingBag, FiStar, FiTrash2, FiUploadCloud, FiX } from "react-icons/fi";
import { auth, db } from "../../firebaseConfig";
import { formatPrice } from "../../formatPrice";
import "./Admin.css";

const ADMIN_EMAIL = "admin.lamatera@gmail.com";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CLOUDINARY_UPLOAD_URL = CLOUDINARY_CLOUD_NAME
    ? `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`
    : "";

const EMPTY_FORM = {
    nombre: "",
    categoria: "mates",
    descripcion: "",
    precio: "",
    precioAnterior: "",
    stock: "0",
    oferta: false,
};

const CATEGORY_OPTIONS = [
    { value: "mates", label: "Mates" },
    { value: "termos", label: "Termos" },
    { value: "accesorios", label: "Accesorios" },
];

const normalizeText = (value = "") =>
    value
        .toString()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const normalizeGalleryImages = (product) => {
    const source = Array.isArray(product?.images)
        ? product.images
        : [];

    const images = source
        .map((image, index) => {
            if (typeof image === "string") {
                return {
                    url: image,
                    publicId: "",
                    key: `${image}-${index}`,
                };
            }

            return {
                url:
                    image?.url ||
                    image?.downloadURL ||
                    image?.secure_url ||
                    "",
                publicId:
                    image?.publicId ||
                    image?.cloudinaryPublicId ||
                    "",
                key:
                    image?.key ||
                    image?.publicId ||
                    image?.cloudinaryPublicId ||
                    `${image?.url || "image"}-${index}`,
            };
        })
        .filter((image) => image.url);

    if (
        product?.img &&
        !images.some((image) => image.url === product.img)
    ) {
        images.unshift({
            url: product.img,
            publicId: product.cloudinaryPublicId || "",
            key: `legacy-${product.id}`,
        });
    }

    return images;
};

const Admin = () => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [loggingIn, setLoggingIn] = useState(false);
    const [accessDenied, setAccessDenied] = useState(false);

    const [productos, setProductos] = useState([]);
    const [productosLoading, setProductosLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("todos");

    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [productForm, setProductForm] = useState(EMPTY_FORM);
    const [savingProduct, setSavingProduct] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState(null);

    const [selectedProductId, setSelectedProductId] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const fileInputRef = useRef(null);

    const [showGalleryModal, setShowGalleryModal] = useState(false);
    const [galleryProductId, setGalleryProductId] = useState(null);
    const [galleryImages, setGalleryImages] = useState([]);
    const [galleryUploading, setGalleryUploading] = useState(false);
    const [galleryUploadProgress, setGalleryUploadProgress] = useState(0);
    const [gallerySaving, setGallerySaving] = useState(false);
    const [galleryDraggingIndex, setGalleryDraggingIndex] = useState(null);

    const galleryInputRef = useRef(null);

    const loadProducts = useCallback(async () => {
        setProductosLoading(true);
        setErrorMessage("");

        try {
            const snapshot = await getDocs(
                query(
                    collection(db, "productos"),
                    orderBy("nombre")
                )
            );

            setProductos(
                snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data(),
                }))
            );
        } catch (error) {
            console.error("Error cargando productos:", error);
            setErrorMessage("No pudimos cargar los productos.");
        } finally {
            setProductosLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                if (
                    currentUser &&
                    currentUser.email?.toLowerCase() !==
                        ADMIN_EMAIL.toLowerCase()
                ) {
                    setAccessDenied(true);
                    setUser(null);
                    signOut(auth);
                    setAuthLoading(false);
                    return;
                }

                setAccessDenied(false);
                setUser(currentUser);
                setAuthLoading(false);
            }
        );

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (user) {
            loadProducts();
        }
    }, [user, loadProducts]);

    useEffect(() => {
        if (!file) {
            setPreview("");
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const selectedProduct = productos.find(
        (product) => product.id === selectedProductId
    );

    const editingProduct = productos.find(
        (product) => product.id === editingProductId
    );

    const galleryProduct = productos.find(
        (product) => product.id === galleryProductId
    );

    const filteredProducts = useMemo(() => {
        const search = normalizeText(searchTerm.trim());

        return productos.filter((product) => {
            const matchesSearch =
                !search ||
                normalizeText(product.nombre).includes(search) ||
                normalizeText(product.descripcion).includes(search);

            const matchesCategory =
                categoryFilter === "todos" ||
                product.categoria === categoryFilter;

            return matchesSearch && matchesCategory;
        });
    }, [productos, searchTerm, categoryFilter]);

    const dashboardStats = useMemo(
        () => ({
            totalProducts: productos.length,
            totalStock: productos.reduce(
                (sum, product) =>
                    sum +
                    Math.max(
                        0,
                        Number(product.stock) || 0
                    ),
                0
            ),
            offerProducts: productos.filter(
                (product) => Boolean(product.oferta)
            ).length,
            outOfStock: productos.filter(
                (product) => Number(product.stock) <= 0
            ).length,
        }),
        [productos]
    );

    const handleLogin = async (event) => {
        event.preventDefault();

        setLoginError("");
        setLoggingIn(true);

        try {
            await signInWithEmailAndPassword(
                auth,
                email.trim(),
                password
            );

            setPassword("");
        } catch (error) {
            console.error(
                "Error iniciando sesión:",
                error
            );

            setLoginError(
                error.code === "auth/invalid-credential" ||
                    error.code === "auth/wrong-password" ||
                    error.code === "auth/user-not-found"
                    ? "El correo o la contraseña son incorrectos."
                    : "No pudimos iniciar sesión. Intentá nuevamente."
            );
        } finally {
            setLoggingIn(false);
        }
    };

    const handleLogout = async () => {
        try {
            await signOut(auth);

            setProductos([]);
            setSelectedProductId("");
            setFile(null);
            setPreview("");
            setSuccessMessage("");
            setErrorMessage("");
            setSearchTerm("");
            setCategoryFilter("todos");
            setShowProductForm(false);

            closeGallery();
        } catch (error) {
            console.error(error);
            setErrorMessage(
                "No pudimos cerrar la sesión."
            );
        }
    };

    const resetProductForm = () => {
        setProductForm(EMPTY_FORM);
        setEditingProductId(null);
        setFile(null);
        setPreview("");
        setUploadProgress(0);
        setShowProductForm(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const openCreateProduct = () => {
        setSuccessMessage("");
        setErrorMessage("");
        setEditingProductId(null);
        setProductForm(EMPTY_FORM);
        setFile(null);
        setPreview("");
        setUploadProgress(0);
        setShowProductForm(true);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const openEditProduct = (product) => {
        setSuccessMessage("");
        setErrorMessage("");
        setEditingProductId(product.id);

        setProductForm({
            nombre: product.nombre || "",
            categoria: product.categoria || "mates",
            descripcion: product.descripcion || "",
            precio:
                product.precio == null
                    ? ""
                    : String(product.precio),
            precioAnterior:
                product.precioAnterior == null
                    ? ""
                    : String(product.precioAnterior),
            stock:
                product.stock == null
                    ? "0"
                    : String(product.stock),
            oferta: Boolean(product.oferta),
        });

        setFile(null);
        setPreview("");
        setUploadProgress(0);
        setShowProductForm(true);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleProductFormChange = (event) => {
        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setProductForm((current) => ({
            ...current,
            [name]:
                type === "checkbox"
                    ? checked
                    : value,
        }));
    };

    const uploadProductImage = async (
        selectedFile,
        onProgress = null
    ) => {
        if (
            !CLOUDINARY_CLOUD_NAME ||
            !CLOUDINARY_UPLOAD_PRESET ||
            !CLOUDINARY_UPLOAD_URL
        ) {
            throw new Error(
                "Cloudinary no está configurado. Revisá VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET."
            );
        }

        const formData = new FormData();

        formData.append(
            "file",
            selectedFile
        );

        formData.append(
            "upload_preset",
            CLOUDINARY_UPLOAD_PRESET
        );

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();

            xhr.open(
                "POST",
                CLOUDINARY_UPLOAD_URL
            );

            xhr.upload.addEventListener(
                "progress",
                (event) => {
                    if (!event.lengthComputable) {
                        return;
                    }

                    const progress = Math.round(
                        (event.loaded /
                            event.total) *
                            100
                    );

                    setUploadProgress(
                        progress
                    );

                    onProgress?.(progress);
                }
            );

            xhr.addEventListener(
                "load",
                () => {
                    let data = null;

                    try {
                        data = JSON.parse(
                            xhr.responseText
                        );
                    } catch {}

                    if (
                        xhr.status >= 200 &&
                        xhr.status < 300
                    ) {
                        if (!data?.secure_url) {
                            const error =
                                new Error(
                                    "Cloudinary no devolvió la URL de la imagen."
                                );

                            error.code =
                                "cloudinary/missing-url";

                            reject(error);
                            return;
                        }

                        setUploadProgress(
                            100
                        );

                        resolve({
                            downloadURL:
                                data.secure_url,
                            publicId:
                                data.public_id ||
                                "",
                        });

                        return;
                    }

                    const error = new Error(
                        data?.error?.message ||
                            "Cloudinary rechazó la imagen."
                    );

                    error.code =
                        "cloudinary/upload-failed";

                    reject(error);
                }
            );

            xhr.addEventListener(
                "error",
                () => {
                    const error = new Error(
                        "No se pudo conectar con Cloudinary."
                    );

                    error.code =
                        "cloudinary/network-error";

                    reject(error);
                }
            );

            xhr.addEventListener(
                "abort",
                () => {
                    const error = new Error(
                        "La subida de la imagen fue cancelada."
                    );

                    error.code =
                        "cloudinary/upload-aborted";

                    reject(error);
                }
            );

            xhr.send(formData);
        });
    };

    const handleSaveProduct = async (event) => {
        event.preventDefault();

        setSuccessMessage("");
        setErrorMessage("");

        const nombre =
            productForm.nombre.trim();

        const descripcion =
            productForm.descripcion.trim();

        const categoria =
            productForm.categoria;

        const precio =
            Number(productForm.precio);

        const precioAnterior =
            productForm.precioAnterior === ""
                ? null
                : Number(
                      productForm.precioAnterior
                  );

        const stock =
            Number(productForm.stock);

        if (!nombre) {
            return setErrorMessage(
                "Ingresá el nombre del producto."
            );
        }

        if (!categoria) {
            return setErrorMessage(
                "Seleccioná una categoría."
            );
        }

        if (
            !Number.isFinite(precio) ||
            precio < 0
        ) {
            return setErrorMessage(
                "Ingresá un precio válido."
            );
        }

        if (
            precioAnterior !== null &&
            (!Number.isFinite(
                precioAnterior
            ) ||
                precioAnterior < 0)
        ) {
            return setErrorMessage(
                "Ingresá un precio anterior válido."
            );
        }

        if (
            !Number.isInteger(stock) ||
            stock < 0
        ) {
            return setErrorMessage(
                "El stock debe ser un número entero mayor o igual a 0."
            );
        }

        if (
            productForm.oferta &&
            precioAnterior !== null &&
            precioAnterior <= precio
        ) {
            return setErrorMessage(
                "El precio anterior debe ser mayor al precio actual cuando el producto está en oferta."
            );
        }

        if (!editingProductId && !file) {
            return setErrorMessage(
                "Seleccioná una imagen principal para el producto."
            );
        }

        setSavingProduct(true);
        setUploadProgress(0);

        let createdProductRef = null;

        try {
            const productData = {
                nombre,
                categoria,
                descripcion,
                precio,
                stock,
                oferta:
                    Boolean(productForm.oferta),
            };

            if (precioAnterior !== null) {
                productData.precioAnterior =
                    precioAnterior;
            }

            if (editingProductId) {
                const productRef = doc(
                    db,
                    "productos",
                    editingProductId
                );

                if (file) {
                    const uploaded =
                        await uploadProductImage(
                            file
                        );

                    const oldImages =
                        normalizeGalleryImages(
                            editingProduct
                        ).filter(
                            (image) =>
                                image.url !==
                                editingProduct?.img
                        );

                    productData.img =
                        uploaded.downloadURL;

                    productData.cloudinaryPublicId =
                        uploaded.publicId;

                    productData.images = [
                        {
                            url: uploaded.downloadURL,
                            publicId:
                                uploaded.publicId ||
                                "",
                        },
                        ...oldImages.map(
                            (image) => ({
                                url: image.url,
                                publicId:
                                    image.publicId ||
                                    "",
                            })
                        ),
                    ];

                    productData.imgStoragePath =
                        deleteField();
                }

                await updateDoc(
                    productRef,
                    productData
                );

                const localProductData = {
                    ...productData,
                };

                delete localProductData.imgStoragePath;

                setProductos(
                    (current) =>
                        current.map(
                            (product) =>
                                product.id ===
                                editingProductId
                                    ? {
                                          ...product,
                                          ...localProductData,
                                      }
                                    : product
                        )
                );

                setSuccessMessage(
                    `El producto "${nombre}" fue actualizado correctamente.`
                );
            } else {
                createdProductRef =
                    await addDoc(
                        collection(
                            db,
                            "productos"
                        ),
                        productData
                    );

                try {
                    const uploaded =
                        await uploadProductImage(
                            file
                        );

                    const imageData = {
                        img:
                            uploaded.downloadURL,
                        cloudinaryPublicId:
                            uploaded.publicId,
                        images: [
                            {
                                url:
                                    uploaded.downloadURL,
                                publicId:
                                    uploaded.publicId ||
                                    "",
                            },
                        ],
                    };

                    await updateDoc(
                        createdProductRef,
                        imageData
                    );

                    const completeProduct = {
                        id:
                            createdProductRef.id,
                        ...productData,
                        ...imageData,
                    };

                    setProductos(
                        (current) =>
                            [
                                ...current,
                                completeProduct,
                            ].sort(
                                (a, b) =>
                                    normalizeText(
                                        a.nombre
                                    ).localeCompare(
                                        normalizeText(
                                            b.nombre
                                        ),
                                        "es"
                                    )
                            )
                    );

                    setSelectedProductId(
                        createdProductRef.id
                    );

                    setSuccessMessage(
                        `El producto "${nombre}" fue creado correctamente.`
                    );
                } catch (uploadError) {
                    try {
                        await deleteDoc(
                            createdProductRef
                        );
                    } catch (
                        cleanupError
                    ) {
                        console.warn(
                            cleanupError
                        );
                    }

                    throw uploadError;
                }
            }

            resetProductForm();
        } catch (error) {
            console.error(
                "Error guardando producto:",
                error
            );

            if (
                error.code ===
                "permission-denied"
            ) {
                setErrorMessage(
                    "Firebase rechazó la operación. Revisá las reglas de Firestore."
                );
            } else if (
                error.code?.startsWith(
                    "cloudinary/"
                ) ||
                error.message
                    ?.toLowerCase()
                    .includes("cloudinary")
            ) {
                setErrorMessage(
                    error.message ||
                        "No pudimos subir la imagen a Cloudinary."
                );
            } else {
                setErrorMessage(
                    "No pudimos guardar el producto. Intentá nuevamente."
                );
            }
        } finally {
            setSavingProduct(false);
        }
    };

    const handleDeleteProduct = async (
        product
    ) => {
        if (
            !window.confirm(
                `¿Querés eliminar "${product.nombre}"?\n\nEsta acción no se puede deshacer.`
            )
        ) {
            return;
        }

        setDeletingProductId(
            product.id
        );

        setSuccessMessage("");
        setErrorMessage("");

        try {
            await deleteDoc(
                doc(
                    db,
                    "productos",
                    product.id
                )
            );

            setProductos(
                (current) =>
                    current.filter(
                        (item) =>
                            item.id !==
                            product.id
                    )
            );

            if (
                selectedProductId ===
                product.id
            ) {
                setSelectedProductId("");
                setFile(null);
                setPreview("");

                if (
                    fileInputRef.current
                ) {
                    fileInputRef.current.value =
                        "";
                }
            }

            if (
                galleryProductId ===
                product.id
            ) {
                closeGallery();
            }

            setSuccessMessage(
                `El producto "${product.nombre}" fue eliminado correctamente.`
            );
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.code ===
                    "permission-denied"
                    ? "Firebase rechazó la eliminación. Revisá las reglas de Firestore."
                    : "No pudimos eliminar el producto. Intentá nuevamente."
            );
        } finally {
            setDeletingProductId(null);
        }
    };

    const handleSelectProductForImage = (
        productId
    ) => {
        setSelectedProductId(
            productId
        );

        setFile(null);
        setPreview("");
        setSuccessMessage("");
        setErrorMessage("");

        if (fileInputRef.current) {
            fileInputRef.current.value =
                "";
        }
    };

    const handleFileChange = (
        event
    ) => {
        const selectedFile =
            event.target.files?.[0];

        setSuccessMessage("");
        setErrorMessage("");

        if (!selectedFile) {
            setFile(null);
            return;
        }

        if (
            !ALLOWED_TYPES.includes(
                selectedFile.type
            )
        ) {
            setFile(null);
            event.target.value = "";

            setErrorMessage(
                "Formato no permitido. Usá JPG, PNG, WEBP o AVIF."
            );

            return;
        }

        if (
            selectedFile.size >
            MAX_FILE_SIZE
        ) {
            setFile(null);
            event.target.value = "";

            setErrorMessage(
                "La imagen no puede superar los 5 MB."
            );

            return;
        }

        setFile(selectedFile);
    };

    const handleUpload = async () => {
        if (!selectedProductId) {
            return setErrorMessage(
                "Seleccioná un producto."
            );
        }

        if (!file) {
            return setErrorMessage(
                "Seleccioná una imagen."
            );
        }

        setUploading(true);
        setUploadProgress(0);
        setSuccessMessage("");
        setErrorMessage("");

        try {
            const uploaded =
                await uploadProductImage(
                    file
                );

            const productRef = doc(
                db,
                "productos",
                selectedProductId
            );

            const product =
                productos.find(
                    (item) =>
                        item.id ===
                        selectedProductId
                );

            const images = [
                {
                    url:
                        uploaded.downloadURL,
                    publicId:
                        uploaded.publicId ||
                        "",
                },
                ...normalizeGalleryImages(
                    product
                )
                    .filter(
                        (image) =>
                            image.url !==
                            product?.img
                    )
                    .map(
                        (image) => ({
                            url: image.url,
                            publicId:
                                image.publicId ||
                                "",
                        })
                    ),
            ];

            await updateDoc(
                productRef,
                {
                    img:
                        uploaded.downloadURL,
                    cloudinaryPublicId:
                        uploaded.publicId,
                    images,
                    imgStoragePath:
                        deleteField(),
                }
            );

            setProductos(
                (current) =>
                    current.map(
                        (item) =>
                            item.id ===
                            selectedProductId
                                ? {
                                      ...item,
                                      img:
                                          uploaded.downloadURL,
                                      cloudinaryPublicId:
                                          uploaded.publicId,
                                      images,
                                  }
                                : item
                    )
            );

            setFile(null);
            setPreview("");
            setUploadProgress(100);

            if (fileInputRef.current) {
                fileInputRef.current.value =
                    "";
            }

            setSuccessMessage(
                `Imagen actualizada correctamente para "${product?.nombre || "el producto"}".`
            );
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.code ===
                    "permission-denied"
                    ? "Firebase rechazó la actualización de la imagen. Revisá las reglas de Firestore."
                    : error.message ||
                      "No pudimos subir la imagen. Intentá nuevamente."
            );
        } finally {
            setUploading(false);
        }
    };

    const openGallery = (product) => {
        setGalleryProductId(
            product.id
        );

        setGalleryImages(
            normalizeGalleryImages(
                product
            )
        );

        setGalleryUploadProgress(0);
        setGalleryDraggingIndex(null);
        setShowGalleryModal(true);

        setErrorMessage("");
        setSuccessMessage("");
    };

    function closeGallery() {
        if (
            galleryUploading ||
            gallerySaving
        ) {
            return;
        }

        setShowGalleryModal(false);
        setGalleryProductId(null);
        setGalleryImages([]);
        setGalleryUploadProgress(0);
        setGalleryDraggingIndex(null);

        if (galleryInputRef.current) {
            galleryInputRef.current.value =
                "";
        }
    }

    const handleGalleryFiles = async (
        event
    ) => {
        const files = Array.from(
            event.target.files || []
        );

        if (
            !files.length ||
            !galleryProductId
        ) {
            return;
        }

        setGalleryUploading(true);
        setGalleryUploadProgress(0);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const uploadedImages = [];

            for (
                let index = 0;
                index < files.length;
                index += 1
            ) {
                const selectedFile =
                    files[index];

                if (
                    !ALLOWED_TYPES.includes(
                        selectedFile.type
                    )
                ) {
                    throw new Error(
                        `"${selectedFile.name}" no tiene un formato permitido. Usá JPG, PNG, WEBP o AVIF.`
                    );
                }

                if (
                    selectedFile.size >
                    MAX_FILE_SIZE
                ) {
                    throw new Error(
                        `"${selectedFile.name}" supera el límite de 5 MB.`
                    );
                }

                const uploaded =
                    await uploadProductImage(
                        selectedFile,
                        (progress) =>
                            setGalleryUploadProgress(
                                Math.round(
                                    (
                                        (
                                            index +
                                            progress /
                                                100
                                        ) /
                                        files.length
                                    ) *
                                        100
                                )
                            )
                    );

                uploadedImages.push({
                    url:
                        uploaded.downloadURL,
                    publicId:
                        uploaded.publicId ||
                        "",
                    key:
                        uploaded.publicId ||
                        `${uploaded.downloadURL}-${Date.now()}-${index}`,
                });
            }

            setGalleryImages(
                (current) => [
                    ...current,
                    ...uploadedImages,
                ]
            );

            setGalleryUploadProgress(
                100
            );
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.message ||
                    "No pudimos subir las imágenes a Cloudinary."
            );
        } finally {
            setGalleryUploading(false);

            if (
                galleryInputRef.current
            ) {
                galleryInputRef.current.value =
                    "";
            }
        }
    };

    const handleGalleryDragStart = (
        index
    ) => {
        setGalleryDraggingIndex(
            index
        );
    };

    const handleGalleryDragOver = (
        event
    ) => {
        event.preventDefault();
    };

    const handleGalleryDrop = (
        targetIndex
    ) => {
        if (
            galleryDraggingIndex ===
                null ||
            galleryDraggingIndex ===
                targetIndex
        ) {
            setGalleryDraggingIndex(
                null
            );
            return;
        }

        setGalleryImages(
            (current) => {
                const next = [
                    ...current,
                ];

                const [moved] =
                    next.splice(
                        galleryDraggingIndex,
                        1
                    );

                next.splice(
                    targetIndex,
                    0,
                    moved
                );

                return next;
            }
        );

        setGalleryDraggingIndex(
            null
        );
    };

    const moveGalleryImage = (
        index,
        direction
    ) => {
        const target =
            index + direction;

        if (
            target < 0 ||
            target >=
                galleryImages.length
        ) {
            return;
        }

        setGalleryImages(
            (current) => {
                const next = [
                    ...current,
                ];

                const [moved] =
                    next.splice(
                        index,
                        1
                    );

                next.splice(
                    target,
                    0,
                    moved
                );

                return next;
            }
        );
    };

    const makeGalleryImagePrimary = (
        index
    ) => {
        if (index === 0) {
            return;
        }

        setGalleryImages(
            (current) => {
                const next = [
                    ...current,
                ];

                const [selected] =
                    next.splice(
                        index,
                        1
                    );

                next.unshift(
                    selected
                );

                return next;
            }
        );
    };

    const deleteGalleryImage = (
        index
    ) => {
        if (
            galleryImages.length <= 1
        ) {
            return setErrorMessage(
                "El producto debe conservar al menos una imagen."
            );
        }

        if (
            !window.confirm(
                "¿Querés quitar esta imagen de la galería?\n\nLa imagen dejará de mostrarse en este producto."
            )
        ) {
            return;
        }

        setGalleryImages(
            (current) =>
                current.filter(
                    (_, imageIndex) =>
                        imageIndex !==
                        index
                )
        );
    };

    const saveGallery = async () => {
        if (!galleryProductId) {
            return;
        }

        if (!galleryImages.length) {
            return setErrorMessage(
                "El producto debe conservar al menos una imagen."
            );
        }

        setGallerySaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const images =
                galleryImages.map(
                    (image) => ({
                        url: image.url,
                        publicId:
                            image.publicId ||
                            "",
                    })
                );

            const primary =
                images[0];

            const galleryData = {
                images,
                img: primary.url,
                cloudinaryPublicId:
                    primary.publicId,
                imgStoragePath:
                    deleteField(),
            };

            await updateDoc(
                doc(
                    db,
                    "productos",
                    galleryProductId
                ),
                galleryData
            );

            setProductos(
                (current) =>
                    current.map(
                        (product) =>
                            product.id ===
                            galleryProductId
                                ? {
                                      ...product,
                                      ...galleryData,
                                      images,
                                  }
                                : product
                    )
            );

            setSuccessMessage(
                `La galería de "${galleryProduct?.nombre || "el producto"}" fue actualizada correctamente.`
            );

            closeGallery();
        } catch (error) {
            console.error(error);

            setErrorMessage(
                error.code ===
                    "permission-denied"
                    ? "Firebase rechazó la actualización de la galería. Revisá las reglas de Firestore."
                    : "No pudimos guardar la galería. Intentá nuevamente."
            );
        } finally {
            setGallerySaving(false);
        }
    };

    if (authLoading) {
        return (
            <main className="admin-page">
                <div className="admin-loading">
                    Cargando administración...
                </div>
            </main>
        );
    }

    if (!user) {
        return (
            <main className="admin-page admin-login-page">
                <section className="admin-login">
                    <div className="admin-login-header">
                        <span className="admin-eyebrow">
                            LA MATERA
                        </span>

                        <h1>
                            Administración
                        </h1>

                        <p>
                            {accessDenied
                                ? "Esta cuenta no tiene permisos para acceder al panel."
                                : "Ingresá para administrar los productos de la tienda."}
                        </p>
                    </div>

                    <form
                        className="admin-login-form"
                        onSubmit={handleLogin}
                    >
                        <label htmlFor="admin-email">
                            Correo electrónico
                        </label>

                        <input
                            id="admin-email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            placeholder="admin@lamatera.com"
                            autoComplete="email"
                            required
                        />

                        <label htmlFor="admin-password">
                            Contraseña
                        </label>

                        <input
                            id="admin-password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />

                        {loginError && (
                            <p className="admin-error">
                                {loginError}
                            </p>
                        )}

                        <button
                            type="submit"
                            className="admin-primary-button"
                            disabled={loggingIn}
                        >
                            {loggingIn
                                ? "Ingresando..."
                                : "Ingresar al panel"}
                        </button>
                    </form>
                </section>
            </main>
        );
    }

    return (
        <main className="admin-page">
            <style>{`
.admin-gallery-modal{width:min(1080px,calc(100vw - 32px));max-width:1080px;max-height:90vh;display:flex;flex-direction:column;overflow:hidden}
.admin-gallery-content{min-height:0;overflow-y:auto;padding:0 28px 28px}
.admin-gallery-toolbar{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:4px 0 22px}
.admin-gallery-toolbar>div{display:flex;flex-direction:column;gap:4px}
.admin-gallery-toolbar strong{font-size:15px}
.admin-gallery-toolbar span{color:#777;font-size:13px}
.admin-gallery-add-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 16px;border-radius:10px;background:#1f1f1f;color:#fff;font-size:14px;font-weight:600;cursor:pointer;white-space:nowrap}
.admin-gallery-add-button:hover{transform:translateY(-1px)}
.admin-gallery-add-button input{display:none}
.admin-gallery-progress{margin-bottom:20px}
.admin-gallery-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:16px}
.admin-gallery-item{overflow:hidden;border:1px solid #e5e0d8;border-radius:16px;background:#fff;transition:border-color .2s,box-shadow .2s,opacity .2s,transform .2s;cursor:grab}
.admin-gallery-item:active{cursor:grabbing}
.admin-gallery-item:hover{border-color:#c9bda9}
.admin-gallery-item.is-primary{border-color:#a58a5f;box-shadow:0 8px 25px rgba(84,66,40,.1)}
.admin-gallery-item.is-dragging{opacity:.45;transform:scale(.98)}
.admin-gallery-image{position:relative;width:100%;aspect-ratio:1/1;overflow:hidden;background:#f5f3ef}
.admin-gallery-image img{display:block;width:100%;height:100%;object-fit:cover}
.admin-gallery-primary-badge{position:absolute;top:10px;left:10px;display:inline-flex;align-items:center;gap:5px;padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.94);color:#765c35;font-size:11px;font-weight:700;box-shadow:0 3px 12px rgba(0,0,0,.08)}
.admin-gallery-drag-badge{position:absolute;right:10px;top:10px;display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.92);color:#777;box-shadow:0 3px 12px rgba(0,0,0,.08)}
.admin-gallery-item-info{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px}
.admin-gallery-item-info>strong{min-width:0;color:#333;font-size:13px}
.admin-gallery-item-actions{display:flex;align-items:center;gap:4px}
.admin-gallery-item-actions button{display:grid;place-items:center;width:30px;height:30px;padding:0;border:1px solid #e2ddd5;border-radius:8px;background:#fff;color:#555;cursor:pointer}
.admin-gallery-item-actions button:hover:not(:disabled){background:#f5f1e9;border-color:#cfc2ae}
.admin-gallery-item-actions button:disabled{cursor:not-allowed;opacity:.35}
.admin-gallery-item-actions button.is-delete{color:#b04d4d}
.admin-gallery-empty{min-height:260px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;border:1px dashed #d8d0c5;border-radius:16px;background:#faf9f7;color:#777;text-align:center}
.admin-gallery-empty svg{width:32px;height:32px;color:#9a896f;margin-bottom:4px}
.admin-gallery-empty strong{color:#333;font-size:15px}
.admin-gallery-empty span{font-size:13px}
.admin-gallery-footer{flex-shrink:0;border-top:1px solid #eee8df;padding:18px 28px;background:#fff}
@media(max-width:760px){
.admin-gallery-modal{width:calc(100vw - 20px);max-height:94vh}
.admin-gallery-content{padding:0 16px 20px}
.admin-gallery-toolbar{align-items:stretch;flex-direction:column}
.admin-gallery-add-button{width:100%}
.admin-gallery-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
.admin-gallery-item-info{align-items:flex-start;flex-direction:column}
.admin-gallery-item-actions{width:100%;justify-content:flex-end}
.admin-gallery-footer{padding:14px 16px}
}
            `}</style>

            <div className="admin-container">
                <header className="admin-header">
                    <div>
                        <span className="admin-eyebrow">
                            LA MATERA
                        </span>

                        <h1>
                            Administración
                        </h1>

                        <p>
                            Gestioná tu tienda desde un solo lugar.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="admin-logout-button"
                        onClick={handleLogout}
                    >
                        <FiLogOut />
                        Cerrar sesión
                    </button>
                </header>

                {successMessage && (
                    <div className="admin-global-success">
                        <FiCheck />

                        <span>
                            {successMessage}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setSuccessMessage("")
                            }
                            aria-label="Cerrar mensaje"
                        >
                            <FiX />
                        </button>
                    </div>
                )}

                {errorMessage && (
                    <div className="admin-global-error">
                        <span>
                            {errorMessage}
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                setErrorMessage("")
                            }
                            aria-label="Cerrar mensaje"
                        >
                            <FiX />
                        </button>
                    </div>
                )}

                <section className="admin-stats-grid">
                    <article className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <FiPackage />
                        </div>

                        <div>
                            <span>
                                Productos
                            </span>

                            <strong>
                                {
                                    dashboardStats.totalProducts
                                }
                            </strong>
                        </div>
                    </article>

                    <article className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <FiShoppingBag />
                        </div>

                        <div>
                            <span>
                                Stock total
                            </span>

                            <strong>
                                {
                                    dashboardStats.totalStock
                                }
                            </strong>
                        </div>
                    </article>

                    <article className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <FiCheck />
                        </div>

                        <div>
                            <span>
                                En oferta
                            </span>

                            <strong>
                                {
                                    dashboardStats.offerProducts
                                }
                            </strong>
                        </div>
                    </article>

                    <article className="admin-stat-card admin-stat-warning">
                        <div className="admin-stat-icon">
                            <FiPackage />
                        </div>

                        <div>
                            <span>
                                Sin stock
                            </span>

                            <strong>
                                {
                                    dashboardStats.outOfStock
                                }
                            </strong>
                        </div>
                    </article>
                </section>

                <section className="admin-card admin-products-card">
                    <div className="admin-section-header">
                        <div>
                            <span className="admin-section-kicker">
                                CATÁLOGO
                            </span>

                            <h2>
                                Productos
                            </h2>

                            <p>
                                Creá, editá y eliminá los productos de tu tienda.
                            </p>
                        </div>

                        <button
                            type="button"
                            className="admin-primary-button admin-new-product-button"
                            onClick={openCreateProduct}
                        >
                            <FiPlus />
                            Nuevo producto
                        </button>
                    </div>

                    <div className="admin-products-toolbar">
                        <div className="admin-search">
                            <FiSearch />

                            <input
                                type="search"
                                value={searchTerm}
                                onChange={(event) =>
                                    setSearchTerm(
                                        event.target.value
                                    )
                                }
                                placeholder="Buscar producto..."
                                aria-label="Buscar producto"
                            />

                            {searchTerm && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchTerm("")
                                    }
                                    aria-label="Limpiar búsqueda"
                                >
                                    <FiX />
                                </button>
                            )}
                        </div>

                        <select
                            value={categoryFilter}
                            onChange={(event) =>
                                setCategoryFilter(
                                    event.target.value
                                )
                            }
                            className="admin-category-filter"
                            aria-label="Filtrar por categoría"
                        >
                            <option value="todos">
                                Todas las categorías
                            </option>

                            {CATEGORY_OPTIONS.map(
                                (category) => (
                                    <option
                                        key={
                                            category.value
                                        }
                                        value={
                                            category.value
                                        }
                                    >
                                        {
                                            category.label
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {productosLoading ? (
                        <div className="admin-products-loading">
                            <span className="admin-spinner" />
                            Cargando productos...
                        </div>
                    ) : filteredProducts.length ===
                      0 ? (
                        <div className="admin-empty-state">
                            <FiPackage />

                            <h3>
                                {productos.length ===
                                0
                                    ? "Todavía no hay productos"
                                    : "No encontramos productos"}
                            </h3>

                            <p>
                                {productos.length ===
                                0
                                    ? "Creá tu primer producto para comenzar."
                                    : "Probá con otra búsqueda o categoría."}
                            </p>

                            {productos.length ===
                                0 && (
                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={
                                        openCreateProduct
                                    }
                                >
                                    <FiPlus />
                                    Crear producto
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="admin-product-table-wrapper">
                            <table className="admin-product-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Producto
                                        </th>
                                        <th>
                                            Categoría
                                        </th>
                                        <th>
                                            Precio
                                        </th>
                                        <th>
                                            Stock
                                        </th>
                                        <th>
                                            Estado
                                        </th>
                                        <th className="admin-actions-column">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredProducts.map(
                                        (product) => {
                                            const stock =
                                                Number(
                                                    product.stock
                                                ) || 0;

                                            return (
                                                <tr
                                                    key={
                                                        product.id
                                                    }
                                                >
                                                    <td>
                                                        <div className="admin-product-cell">
                                                            <div className="admin-product-thumbnail">
                                                                {product.img ? (
                                                                    <img
                                                                        src={
                                                                            product.img
                                                                        }
                                                                        alt=""
                                                                    />
                                                                ) : (
                                                                    <FiImage />
                                                                )}
                                                            </div>

                                                            <div>
                                                                <strong>
                                                                    {
                                                                        product.nombre
                                                                    }
                                                                </strong>

                                                                <small>
                                                                    ID:{" "}
                                                                    {
                                                                        product.id
                                                                    }
                                                                </small>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <span className="admin-category-badge">
                                                            {
                                                                product.categoria ||
                                                                "Sin categoría"
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <strong>
                                                            {formatPrice(
                                                                product.precio
                                                            )}
                                                        </strong>
                                                    </td>

                                                    <td>
                                                        <span
                                                            className={`admin-stock-value ${
                                                                stock <=
                                                                0
                                                                    ? "is-empty"
                                                                    : stock <=
                                                                      3
                                                                    ? "is-low"
                                                                    : ""
                                                            }`}
                                                        >
                                                            {
                                                                stock
                                                            }
                                                        </span>
                                                    </td>

                                                    <td>
                                                        <div className="admin-status-list">
                                                            {product.oferta && (
                                                                <span className="admin-status admin-status-offer">
                                                                    Oferta
                                                                </span>
                                                            )}

                                                            {stock >
                                                            0 ? (
                                                                <span className="admin-status admin-status-stock">
                                                                    Disponible
                                                                </span>
                                                            ) : (
                                                                <span className="admin-status admin-status-empty">
                                                                    Sin stock
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>

                                                    <td>
                                                        <div className="admin-product-actions">
                                                            <button
                                                                type="button"
                                                                className="admin-action-button"
                                                                onClick={() =>
                                                                    openEditProduct(
                                                                        product
                                                                    )
                                                                }
                                                                title="Editar producto"
                                                            >
                                                                <FiEdit3 />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="admin-action-button admin-action-image"
                                                                onClick={() =>
                                                                    openGallery(
                                                                        product
                                                                    )
                                                                }
                                                                title="Gestionar galería"
                                                            >
                                                                <FiImage />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="admin-action-button admin-action-delete"
                                                                onClick={() =>
                                                                    handleDeleteProduct(
                                                                        product
                                                                    )
                                                                }
                                                                disabled={
                                                                    deletingProductId ===
                                                                    product.id
                                                                }
                                                                title="Eliminar producto"
                                                            >
                                                                {deletingProductId ===
                                                                product.id ? (
                                                                    <span className="admin-mini-spinner" />
                                                                ) : (
                                                                    <FiTrash2 />
                                                                )}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                <section className="admin-card admin-image-card">
                    <div className="admin-section-header">
                        <div>
                            <span className="admin-section-kicker">
                                IMAGEN PRINCIPAL
                            </span>

                            <h2>
                                Actualizar imagen
                            </h2>

                            <p>
                                Seleccioná un producto y subí una nueva imagen desde tu PC.
                            </p>
                        </div>
                    </div>

                    <div className="admin-image-product-selector">
                        <label htmlFor="admin-product-image">
                            Producto
                        </label>

                        <select
                            id="admin-product-image"
                            value={selectedProductId}
                            onChange={(event) =>
                                handleSelectProductForImage(
                                    event.target.value
                                )
                            }
                            disabled={
                                productosLoading ||
                                uploading
                            }
                        >
                            <option value="">
                                Seleccioná un producto
                            </option>

                            {productos.map(
                                (product) => (
                                    <option
                                        key={
                                            product.id
                                        }
                                        value={
                                            product.id
                                        }
                                    >
                                        {
                                            product.nombre
                                        }
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    {selectedProduct && (
                        <div className="admin-selected-product">
                            <div className="admin-selected-image">
                                {selectedProduct.img ? (
                                    <img
                                        src={
                                            selectedProduct.img
                                        }
                                        alt={
                                            selectedProduct.nombre
                                        }
                                    />
                                ) : (
                                    <FiImage />
                                )}
                            </div>

                            <div>
                                <span>
                                    Producto seleccionado
                                </span>

                                <strong>
                                    {
                                        selectedProduct.nombre
                                    }
                                </strong>

                                <small>
                                    {
                                        selectedProduct.categoria ||
                                        "Sin categoría"
                                    }
                                </small>
                            </div>
                        </div>
                    )}

                    <label
                        className={`admin-upload-area ${
                            file
                                ? "has-file"
                                : ""
                        }`}
                    >
                        <input
                            ref={
                                fileInputRef
                            }
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            onChange={
                                handleFileChange
                            }
                            disabled={
                                uploading
                            }
                        />

                        {preview ? (
                            <div className="admin-preview">
                                <img
                                    src={preview}
                                    alt="Vista previa"
                                />

                                <div className="admin-preview-info">
                                    <strong>
                                        {
                                            file.name
                                        }
                                    </strong>

                                    <span>
                                        {(
                                            file.size /
                                            1024 /
                                            1024
                                        ).toFixed(
                                            2
                                        )}{" "}
                                        MB
                                    </span>

                                    <small>
                                        Hacé clic para cambiar la imagen
                                    </small>
                                </div>
                            </div>
                        ) : (
                            <div className="admin-upload-empty">
                                <FiUploadCloud />

                                <strong>
                                    Seleccioná una imagen
                                </strong>

                                <span>
                                    JPG, PNG, WEBP o AVIF
                                </span>

                                <small>
                                    Máximo 5 MB
                                </small>
                            </div>
                        )}
                    </label>

                    {uploading && (
                        <div className="admin-progress">
                            <div className="admin-progress-header">
                                <span>
                                    Subiendo imagen...
                                </span>

                                <strong>
                                    {
                                        uploadProgress
                                    }
                                    %
                                </strong>
                            </div>

                            <div className="admin-progress-track">
                                <div
                                    className="admin-progress-bar"
                                    style={{
                                        width: `${uploadProgress}%`,
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <button
                        type="button"
                        className="admin-primary-button admin-upload-button"
                        onClick={
                            handleUpload
                        }
                        disabled={
                            uploading ||
                            !selectedProductId ||
                            !file
                        }
                    >
                        <FiUploadCloud />

                        {uploading
                            ? `Subiendo ${uploadProgress}%`
                            : "Subir y guardar imagen"}
                    </button>
                </section>
            </div>

            {showProductForm && (
                <div
                    className="admin-modal-backdrop"
                    onMouseDown={(
                        event
                    ) => {
                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            resetProductForm();
                        }
                    }}
                >
                    <section
                        className="admin-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="admin-product-form-title"
                    >
                        <div className="admin-modal-header">
                            <div>
                                <span className="admin-section-kicker">
                                    {editingProductId
                                        ? "EDITAR PRODUCTO"
                                        : "NUEVO PRODUCTO"}
                                </span>

                                <h2 id="admin-product-form-title">
                                    {editingProductId
                                        ? "Editar producto"
                                        : "Crear producto"}
                                </h2>

                                <p>
                                    Completá los datos principales del producto.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="admin-modal-close"
                                onClick={
                                    resetProductForm
                                }
                                disabled={
                                    savingProduct
                                }
                                aria-label="Cerrar"
                            >
                                <FiX />
                            </button>
                        </div>

                        <form
                            className="admin-product-form"
                            onSubmit={
                                handleSaveProduct
                            }
                        >
                            <div className="admin-form-grid">
                                <div className="admin-field admin-field-full">
                                    <label htmlFor="admin-product-name">
                                        Nombre
                                    </label>

                                    <input
                                        id="admin-product-name"
                                        name="nombre"
                                        type="text"
                                        value={
                                            productForm.nombre
                                        }
                                        onChange={
                                            handleProductFormChange
                                        }
                                        placeholder="Ej. Mate Imperial"
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="admin-product-category">
                                        Categoría
                                    </label>

                                    <select
                                        id="admin-product-category"
                                        name="categoria"
                                        value={
                                            productForm.categoria
                                        }
                                        onChange={
                                            handleProductFormChange
                                        }
                                        required
                                    >
                                        {CATEGORY_OPTIONS.map(
                                            (
                                                category
                                            ) => (
                                                <option
                                                    key={
                                                        category.value
                                                    }
                                                    value={
                                                        category.value
                                                    }
                                                >
                                                    {
                                                        category.label
                                                    }
                                                </option>
                                            )
                                        )}
                                    </select>
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="admin-product-stock">
                                        Stock
                                    </label>

                                    <input
                                        id="admin-product-stock"
                                        name="stock"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            productForm.stock
                                        }
                                        onChange={
                                            handleProductFormChange
                                        }
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="admin-product-price">
                                        Precio
                                    </label>

                                    <input
                                        id="admin-product-price"
                                        name="precio"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            productForm.precio
                                        }
                                        onChange={
                                            handleProductFormChange
                                        }
                                        placeholder="50000"
                                        required
                                    />
                                </div>

                                <div className="admin-field">
                                    <label htmlFor="admin-product-old-price">
                                        Precio anterior
                                    </label>

                                    <input
                                        id="admin-product-old-price"
                                        name="precioAnterior"
                                        type="number"
                                        min="0"
                                        step="1"
                                        value={
                                            productForm.precioAnterior
                                        }
                                        onChange={
                                            handleProductFormChange
                                        }
                                        placeholder="65000"
                                    />
                                </div>

                                <div className="admin-field admin-field-full">
                                    <label htmlFor="admin-product-description">
                                        Descripción
                                    </label>

                                    <textarea
                                        id="admin-product-description"
                                        name="descripcion"
                                        value={
                                            productForm.descripcion
                                        }
                                        onChange={
                                            handleProductFormChange
                                        }
                                        placeholder="Describí el producto..."
                                        rows="5"
                                    />
                                </div>

                                <div className="admin-field admin-field-full">
                                    <label>
                                        Imagen principal{" "}
                                        {!editingProductId &&
                                            "(obligatoria)"}
                                    </label>

                                    {editingProductId &&
                                        editingProduct?.img &&
                                        !file && (
                                            <div className="admin-selected-product">
                                                <div className="admin-selected-image">
                                                    <img
                                                        src={
                                                            editingProduct.img
                                                        }
                                                        alt={
                                                            editingProduct.nombre
                                                        }
                                                    />
                                                </div>

                                                <div>
                                                    <span>
                                                        Imagen actual
                                                    </span>

                                                    <strong>
                                                        {
                                                            editingProduct.nombre
                                                        }
                                                    </strong>

                                                    <small>
                                                        Seleccioná otra imagen si querés reemplazarla.
                                                    </small>
                                                </div>
                                            </div>
                                        )}

                                    <label
                                        className={`admin-upload-area ${
                                            file
                                                ? "has-file"
                                                : ""
                                        }`}
                                    >
                                        <input
                                            ref={
                                                fileInputRef
                                            }
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/avif"
                                            onChange={
                                                handleFileChange
                                            }
                                            disabled={
                                                savingProduct
                                            }
                                        />

                                        {preview ? (
                                            <div className="admin-preview">
                                                <img
                                                    src={
                                                        preview
                                                    }
                                                    alt="Vista previa"
                                                />

                                                <div className="admin-preview-info">
                                                    <strong>
                                                        {
                                                            file.name
                                                        }
                                                    </strong>

                                                    <span>
                                                        {(
                                                            file.size /
                                                            1024 /
                                                            1024
                                                        ).toFixed(
                                                            2
                                                        )}{" "}
                                                        MB
                                                    </span>

                                                    <small>
                                                        Hacé clic para cambiar la imagen
                                                    </small>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="admin-upload-empty">
                                                <FiUploadCloud />

                                                <strong>
                                                    Seleccioná una imagen
                                                </strong>

                                                <span>
                                                    JPG, PNG, WEBP o AVIF
                                                </span>

                                                <small>
                                                    Máximo 5 MB
                                                </small>
                                            </div>
                                        )}
                                    </label>
                                </div>

                                <label className="admin-checkbox-field admin-field-full">
                                    <input
                                        name="oferta"
                                        type="checkbox"
                                        checked={
                                            productForm.oferta
                                        }
                                        onChange={
                                            handleProductFormChange
                                        }
                                    />

                                    <span className="admin-checkbox">
                                        <FiCheck />
                                    </span>

                                    <span>
                                        <strong>
                                            Producto en oferta
                                        </strong>

                                        <small>
                                            Activá esta opción si querés mostrar el producto como oferta.
                                        </small>
                                    </span>
                                </label>
                            </div>

                            <div className="admin-form-footer">
                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={
                                        resetProductForm
                                    }
                                    disabled={
                                        savingProduct
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="submit"
                                    className="admin-primary-button"
                                    disabled={
                                        savingProduct
                                    }
                                >
                                    {savingProduct ? (
                                        <>
                                            <span className="admin-mini-spinner" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheck />

                                            {editingProductId
                                                ? "Guardar cambios"
                                                : "Crear producto"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </section>
                </div>
            )}

            {showGalleryModal &&
                galleryProduct && (
                    <div
                        className="admin-modal-backdrop"
                        onMouseDown={(
                            event
                        ) => {
                            if (
                                event.target ===
                                event.currentTarget
                            ) {
                                closeGallery();
                            }
                        }}
                    >
                        <section
                            className="admin-modal admin-gallery-modal"
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby="admin-gallery-title"
                        >
                            <div className="admin-modal-header">
                                <div>
                                    <span className="admin-section-kicker">
                                        GALERÍA DEL PRODUCTO
                                    </span>

                                    <h2 id="admin-gallery-title">
                                        {
                                            galleryProduct.nombre
                                        }
                                    </h2>

                                    <p>
                                        Agregá, ordená y elegí la imagen principal.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="admin-modal-close"
                                    onClick={
                                        closeGallery
                                    }
                                    disabled={
                                        galleryUploading ||
                                        gallerySaving
                                    }
                                    aria-label="Cerrar"
                                >
                                    <FiX />
                                </button>
                            </div>

                            <div className="admin-gallery-content">
                                <div className="admin-gallery-toolbar">
                                    <div>
                                        <strong>
                                            {
                                                galleryImages.length
                                            }{" "}
                                            {galleryImages.length ===
                                            1
                                                ? "imagen"
                                                : "imágenes"}
                                        </strong>

                                        <span>
                                            La primera imagen es la principal.
                                        </span>
                                    </div>

                                    <label className="admin-gallery-add-button">
                                        <input
                                            ref={
                                                galleryInputRef
                                            }
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp,image/avif"
                                            multiple
                                            onChange={
                                                handleGalleryFiles
                                            }
                                            disabled={
                                                galleryUploading ||
                                                gallerySaving
                                            }
                                        />

                                        <FiPlus />
                                        Agregar imágenes
                                    </label>
                                </div>

                                {galleryUploading && (
                                    <div className="admin-progress admin-gallery-progress">
                                        <div className="admin-progress-header">
                                            <span>
                                                Subiendo imágenes...
                                            </span>

                                            <strong>
                                                {
                                                    galleryUploadProgress
                                                }
                                                %
                                            </strong>
                                        </div>

                                        <div className="admin-progress-track">
                                            <div
                                                className="admin-progress-bar"
                                                style={{
                                                    width: `${galleryUploadProgress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {galleryImages.length ===
                                0 ? (
                                    <div className="admin-gallery-empty">
                                        <FiImage />

                                        <strong>
                                            Todavía no hay imágenes
                                        </strong>

                                        <span>
                                            Agregá una o varias imágenes para este producto.
                                        </span>
                                    </div>
                                ) : (
                                    <div className="admin-gallery-grid">
                                        {galleryImages.map(
                                            (
                                                image,
                                                index
                                            ) => (
                                                <article
                                                    key={
                                                        image.key ||
                                                        `${image.url}-${index}`
                                                    }
                                                    className={`admin-gallery-item ${
                                                        index ===
                                                        0
                                                            ? "is-primary"
                                                            : ""
                                                    } ${
                                                        galleryDraggingIndex ===
                                                        index
                                                            ? "is-dragging"
                                                            : ""
                                                    }`}
                                                    draggable={
                                                        !galleryUploading &&
                                                        !gallerySaving
                                                    }
                                                    onDragStart={() =>
                                                        handleGalleryDragStart(
                                                            index
                                                        )
                                                    }
                                                    onDragOver={
                                                        handleGalleryDragOver
                                                    }
                                                    onDrop={() =>
                                                        handleGalleryDrop(
                                                            index
                                                        )
                                                    }
                                                >
                                                    <div className="admin-gallery-image">
                                                        <img
                                                            src={
                                                                image.url
                                                            }
                                                            alt={`${galleryProduct.nombre} ${index + 1}`}
                                                        />

                                                        {index ===
                                                            0 && (
                                                            <span className="admin-gallery-primary-badge">
                                                                <FiStar />
                                                                Principal
                                                            </span>
                                                        )}

                                                        <span className="admin-gallery-drag-badge">
                                                            <FiMove />
                                                        </span>
                                                    </div>

                                                    <div className="admin-gallery-item-info">
                                                        <strong>
                                                            Imagen{" "}
                                                            {
                                                                index +
                                                                1
                                                            }
                                                        </strong>

                                                        <div className="admin-gallery-item-actions">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    makeGalleryImagePrimary(
                                                                        index
                                                                    )
                                                                }
                                                                disabled={
                                                                    index ===
                                                                        0 ||
                                                                    galleryUploading ||
                                                                    gallerySaving
                                                                }
                                                                title="Hacer principal"
                                                            >
                                                                <FiStar />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    moveGalleryImage(
                                                                        index,
                                                                        -1
                                                                    )
                                                                }
                                                                disabled={
                                                                    index ===
                                                                        0 ||
                                                                    galleryUploading ||
                                                                    gallerySaving
                                                                }
                                                                title="Mover izquierda"
                                                            >
                                                                <FiChevronLeft />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    moveGalleryImage(
                                                                        index,
                                                                        1
                                                                    )
                                                                }
                                                                disabled={
                                                                    index ===
                                                                        galleryImages.length -
                                                                            1 ||
                                                                    galleryUploading ||
                                                                    gallerySaving
                                                                }
                                                                title="Mover derecha"
                                                            >
                                                                <FiChevronRight />
                                                            </button>

                                                            <button
                                                                type="button"
                                                                className="is-delete"
                                                                onClick={() =>
                                                                    deleteGalleryImage(
                                                                        index
                                                                    )
                                                                }
                                                                disabled={
                                                                    galleryImages.length <=
                                                                        1 ||
                                                                    galleryUploading ||
                                                                    gallerySaving
                                                                }
                                                                title="Quitar imagen"
                                                            >
                                                                <FiTrash2 />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </article>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="admin-form-footer admin-gallery-footer">
                                <button
                                    type="button"
                                    className="admin-secondary-button"
                                    onClick={
                                        closeGallery
                                    }
                                    disabled={
                                        galleryUploading ||
                                        gallerySaving
                                    }
                                >
                                    Cancelar
                                </button>

                                <button
                                    type="button"
                                    className="admin-primary-button"
                                    onClick={
                                        saveGallery
                                    }
                                    disabled={
                                        galleryUploading ||
                                        gallerySaving ||
                                        galleryImages.length ===
                                            0
                                    }
                                >
                                    {gallerySaving ? (
                                        <>
                                            <span className="admin-mini-spinner" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <FiCheck />
                                            Guardar galería
                                        </>
                                    )}
                                </button>
                            </div>
                        </section>
                    </div>
                )}
        </main>
    );
};

export default Admin;
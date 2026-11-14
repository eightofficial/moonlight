"use client";

import { useCallback, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  createProduct,
  deleteProduct,
  findProducts,
  sliderUpdate,
  updateProduct,
} from "@/services/admin/apiService/Product";
import { imageKitUpload } from "@/services/admin/imagekit/imagekitUploader";
import "./amodal.scss";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { slugify } from "@/utilis/slujgify";

const CATEGORIES = [
  "Paper Plate Making Machine",
  "Paper Plate Lamination Machine",
  "Paper Cup Making Machine",
  "Dona Making Machine",
  "Areca Leaf Plate Making Machine",
  "Disposable Plate Making Machine",
  "Chappal Making Machine",
];
const MACHINE_TYPES = [
  "Manual",
  "Semi-Automatic",
  "Full-Automatic",
  "Hydraulic",
];

const AVAILABILITY_OPTIONS = ["In Stock", "Out of Stock", "Made to Order"];
const STATUS_OPTIONS = ["active", "inactive", "draft"];

const emptyDraft = {
  name: "",
  slug: "",
  sku: "",
  category: CATEGORIES[0],
  subCategory: "",
  machineType: "",
  description: "",
  pageTitle: "",
  metaDescription: "",
  metaKeywords: "",
  specifications: {
    productionCapacity: "",
    motor: "",
    totalPower: "",
    powerSource: "",
    voltage: "",
    phase: "",
    weight: "",
    rawMaterial: "",
    dimensions: { length: "", width: "", height: "", unit: "inch" },
    plateSizeRange: "",
    rollerSize: "",
    drive: "",
    paperCupSizeRange: "",
    electricityBillEstimate: "",
  },
  pricing: {
    currency: "INR",
    basePrice: "",
    priceLabel: "Gurgaon Price",
    otherExpenses: "",
    totalPrice: 0,
  },
  itemsProduced: [],
  features: [],
  tags: [],
  images: [],
  warranty: "",
  deliveryTime: "",
  availability: "In Stock",
  isReturnable: false,
  mainMarket: "India",
  status: "active",
  stock: "",
  threshold: "",
  slider: false,
  slider_image: "",
  video: false,
  video_link: "",
};

function makeId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function validateDraft(draft) {
  const errors = {};
  if (!draft.name?.trim()) errors.name = "Product name is required.";
  if (!draft.category) errors.category = "Category is required.";
  if (draft.pricing.basePrice === "" || Number(draft.pricing.basePrice) < 0) {
    errors.basePrice = "Enter a valid base price.";
  }
  if (draft.stock === "" || Number(draft.stock) < 0) {
    errors.stock = "Enter a valid stock quantity.";
  }
  return errors;
}

export function SearchBox({ searchQuery, setSearchQuery }) {
  return (
    <div className="ad-toolbar">
      <input
        type="text"
        className="ad-input ad-search"
        placeholder="Search by name, SKU or category"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
}

function buildPayload(draft) {
  const toNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const number = Number(value);
    return Number.isNaN(number) ? null : number;
  };

  return {
    ...draft,
    specifications: {
      ...draft.specifications,
      dimensions: {
        ...draft.specifications.dimensions,
        length: toNumber(draft.specifications.dimensions.length),
        width: toNumber(draft.specifications.dimensions.width),
        height: toNumber(draft.specifications.dimensions.height),
      },
    },
    pricing: {
      ...draft.pricing,
      basePrice: toNumber(draft.pricing.basePrice) ?? 0,
      otherExpenses: toNumber(draft.pricing.otherExpenses) ?? 0,
      totalPrice: toNumber(draft.pricing.totalPrice) ?? 0,
    },
    stock: toNumber(draft.stock) ?? 0,
    threshold: toNumber(draft.threshold) ?? 0,
    images: draft.images || [],
    slider: draft.slider || false,
    slider_image: draft.slider_image || "",
    video: draft.video || false,
    video_link: draft.video_link || "",
  };
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function ChipInput({ label, placeholder, values, onChange }) {
  const [text, setText] = useState("");

  const addChip = () => {
    const next = text.trim();
    if (!next) return;
    if (values.includes(next)) {
      setText("");
      return;
    }
    onChange([...values, next]);
    setText("");
  };

  const removeChip = (idx) =>
    onChange(values.filter((_, index) => index !== idx));

  return (
    <div className="ad-field">
      <label className="ad-label">{label}</label>
      <div className="ad-chip-row">
        <input
          className="ad-input"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addChip();
            }
          }}
        />
        <button
          type="button"
          className="ad-btn-secondary ad-chip-add"
          onClick={addChip}
        >
          Add
        </button>
      </div>
      {values.length > 0 && (
        <div className="ad-chip-list">
          {values.map((value, index) => (
            <span className="ad-chip" key={`${value}-${index}`}>
              {value}
              <button
                type="button"
                className="ad-chip-remove"
                onClick={() => removeChip(index)}
                aria-label={`Remove ${value}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductAdmin({ compact = false }) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState(emptyDraft);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [uploading, setUploading] = useState({});
  const [sliderUploading, setSliderUploading] = useState(false);

  const {
    data: queryData,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const response = await findProducts();
      if (!response?.success) {
        throw new Error(response?.error || "Failed to load products.");
      }
      return response.data;
    },
  });

  const products = useMemo(
    () =>
      (queryData || []).map((item) => ({
        ...item,
        id: item._id || item.id || makeId(),
      })),
    [queryData],
  );

  const fetchError = isError
    ? error?.message || "Could not load products."
    : "";

  const openAdd = () => {
    setEditingId(null);
    setDraft(emptyDraft);
    setErrors({});
    setSubmitError("");
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setDraft({
      name: product.name || "",
      slug: product.slug || "",
      sku: product.sku || "",
      category: product.category || CATEGORIES[0],
      subCategory: product.subCategory || "",
      machineType: product.machineType || "",
      description: product.description || "",
      pageTitle: product.pageTitle || "",
      metaDescription: product.metaDescription || "",
      metaKeywords: product.metaKeywords || "",
      specifications: {
        productionCapacity: product.specifications?.productionCapacity || "",
        motor: product.specifications?.motor || "",
        totalPower: product.specifications?.totalPower || "",
        powerSource: product.specifications?.powerSource || "",
        voltage: product.specifications?.voltage || "",
        phase: product.specifications?.phase || "",
        weight: product.specifications?.weight || "",
        rawMaterial: product.specifications?.rawMaterial || "",
        dimensions: {
          length: product.specifications?.dimensions?.length ?? "",
          width: product.specifications?.dimensions?.width ?? "",
          height: product.specifications?.dimensions?.height ?? "",
          unit: product.specifications?.dimensions?.unit || "inch",
        },
        plateSizeRange: product.specifications?.plateSizeRange || "",
        rollerSize: product.specifications?.rollerSize || "",
        drive: product.specifications?.drive || "",
        paperCupSizeRange: product.specifications?.paperCupSizeRange || "",
        electricityBillEstimate:
          product.specifications?.electricityBillEstimate || "",
      },
      pricing: {
        currency: product.pricing?.currency || "INR",
        basePrice: product.pricing?.basePrice ?? "",
        priceLabel: product.pricing?.priceLabel || "Gurgaon Price",
        otherExpenses: product.pricing?.otherExpenses ?? "",
        totalPrice: product.pricing?.totalPrice ?? 0,
      },
      itemsProduced: product.itemsProduced || [],
      features: product.features || [],
      tags: product.tags || [],
      images: product.images || [],
      warranty: product.warranty || "",
      deliveryTime: product.deliveryTime || "",
      availability: product.availability || "In Stock",
      isReturnable: product.isReturnable || false,
      mainMarket: product.mainMarket || "India",
      status: product.status || "active",
      stock: product.stock ?? "",
      threshold: product.threshold ?? "",
      slider: product.slider || false,
      slider_image: product.slider_image || "",
      video: product.video || false,
      video_link: product.video_link || "",
    });
    setErrors({});
    setSubmitError("");
    setModalOpen(true);
  };

  const openSliderEditor = (product) => {
    openEdit({
      ...product,
      slider: true,
      slider_image: product.slider_image || "",
    });
  };

  const closeModal = () => {
    if (isSubmitting) return;
    setModalOpen(false);
    setEditingId(null);
    setDraft(emptyDraft);
    setErrors({});
    setSubmitError("");
  };

  const setField = useCallback(
    (field, value) => setDraft((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const setSpec = useCallback(
    (field, value) =>
      setDraft((prev) => ({
        ...prev,
        specifications: { ...prev.specifications, [field]: value },
      })),
    [],
  );

  const setDimension = useCallback(
    (field, value) =>
      setDraft((prev) => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          dimensions: { ...prev.specifications.dimensions, [field]: value },
        },
      })),
    [],
  );

  const setPricing = useCallback((field, value) => {
    setDraft((prev) => {
      const pricing = { ...prev.pricing, [field]: value };
      if (field === "basePrice" || field === "otherExpenses") {
        const base =
          parseFloat(field === "basePrice" ? value : pricing.basePrice) || 0;
        const other =
          parseFloat(
            field === "otherExpenses" ? value : pricing.otherExpenses,
          ) || 0;
        pricing.totalPrice = base + other;
      }
      return { ...prev, pricing };
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;

    // Add previews immediately and mark as uploading
    const previews = acceptedFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));

    setDraft((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...previews.map((p) => p.preview)],
    }));

    // mark all as uploading
    setUploading((prev) => {
      const next = { ...prev };
      previews.forEach((p) => (next[p.preview] = true));
      return next;
    });

    // Upload each file and replace preview with final URL
    await Promise.all(
      previews.map(async ({ file, preview }) => {
        try {
          const url = await imageKitUpload(file);
          // replace preview with final url
          setDraft((prev) => ({
            ...prev,
            images: prev.images.map((img) => (img === preview ? url : img)),
          }));
        } catch (err) {
          console.error("ImageKit upload failed for file:", file.name, err);
          // remove the preview on failure
          setDraft((prev) => ({
            ...prev,
            images: prev.images.filter((img) => img !== preview),
          }));
        } finally {
          setUploading((prev) => {
            const next = { ...prev };
            delete next[preview];
            return next;
          });
          // revoke object URL to free memory
          try {
            URL.revokeObjectURL(preview);
          } catch (e) {}
        }
      }),
    );
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const removeImage = (index) => {
    setDraft((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== index),
    }));
  };

  const handleSliderImageUpload = async (file) => {
    if (!file) return;
    setSliderUploading(true);
    try {
      const url = await imageKitUpload(file);
      setField("slider_image", url);
      setField("slider", true);
    } catch (error) {
      window.alert(error?.message || "Failed to upload slider image.");
    } finally {
      setSliderUploading(false);
    }
  };

  const saveDraft = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateDraft(draft);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const payload = buildPayload(draft);
      let response;

      if (editingId) {
        response = await updateProduct(editingId, payload);
        if (!response?.success) {
          throw new Error(response?.error || "Update failed.");
        }
      } else {
        response = await createProduct(payload);
        if (!response?.success) {
          throw new Error(response?.error || "Create failed.");
        }
      }

      await queryClient.invalidateQueries(["products"]);
      closeModal();
    } catch (error) {
      setSubmitError(error?.message || "Failed to save product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      const response = await deleteProduct(productId);
      if (!response?.success) {
        throw new Error(response?.error || "Delete failed.");
      }
      await queryClient.invalidateQueries(["products"]);
    } catch (error) {
      window.alert(error?.message || "Could not delete product.");
    }
  };
  const handelSlider = async (productId, sld_active) => {
    try {
      const response = await sliderUpdate(productId, sld_active);
      if (!response?.success) {
        throw new Error(response?.error || "Delete failed.");
      }
      await queryClient.invalidateQueries(["products"]);
    } catch (error) {
      window.alert(error?.message || "Could not delete product.");
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((product) => {
      const query = searchQuery.toLowerCase();
      return (
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.category?.toLowerCase().includes(query)
      );
    });
  }, [products, searchQuery]);

  const totalPriceDisplay = useMemo(
    () => draft.pricing.totalPrice || 0,
    [draft.pricing.totalPrice],
  );

  return (
    <div
      className={
        compact
          ? "ad-page ad-admin-page ad-admin-embedded"
          : "ad-page ad-admin-page"
      }
    >
      {compact && (
        <div className="bt-main w-full flex justify-end items-end py-8">
          <button
            className=" flex justify-end items-end bg-[#f2b705] text-[#15140f] hover:bg-[#e2a704] p-2"
            onClick={openAdd}
          >
            + Add product
          </button>
        </div>
      )}

      {/* {compact && (
        <SearchBox searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      )} */}

      {isLoading ? (
        <div className="ad-empty">Loading products…</div>
      ) : fetchError ? (
        <div className="ad-error-text">{fetchError}</div>
      ) : filteredProducts.length === 0 ? (
        <div className="ad-empty">
          No products found. Add the first product to get started.
        </div>
      ) : (
        <div className="ad-product-list">
          {filteredProducts.map((product) => (
            <div className="ad-product-card" key={product.id}>
              <div className="ad-product-card-left">
                <div className="ad-product-thumb">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt={product.name} />
                  ) : (
                    <span>No image</span>
                  )}
                </div>
                <div className="ad-product-info">
                  <div className="ad-product-name">
                    {product.name || "Untitled product"}
                  </div>
                  <div className="ad-product-meta">
                    {product.category} · {product.sku}
                  </div>
                  <div className="ad-product-stats">
                    <span>{product.availability || "In Stock"}</span>
                    <span>{product.status || "active"}</span>
                  </div>
                </div>
              </div>

              <div className="ad-product-right">
                <div className="ad-product-price">
                  {product.pricing?.currency || "INR"}{" "}
                  {product.pricing?.totalPrice ?? 0}
                </div>
                <div className="ad-product-stock">
                  Stock: {product.stock ?? 0} / Threshold:{" "}
                  {product.threshold ?? 0}
                </div>
                <div className="ad-product-actions">
                  {product.slider ? (
                    <>
                      <button
                        className="ad-btn-secondary bg-red-700 text-white"
                        onClick={() => handelSlider(product.id, false)}
                      >
                        Remove slider
                      </button>
                      <button
                        className="ad-btn-secondary"
                        onClick={() => openSliderEditor(product)}
                      >
                        Edit slider
                      </button>
                    </>
                  ) : (
                    <button
                      className="ad-btn-secondary"
                      onClick={() => openSliderEditor(product)}
                    >
                      Add slider
                    </button>
                  )}

                  <button
                    className="ad-btn-secondary"
                    onClick={() => openEdit(product)}
                  >
                    Edit
                  </button>
                  <button
                    className="ad-btn-secondary"
                    onClick={() => handleDelete(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="ad-overlay" onClick={closeModal}>
          <div
            className="ad-modal ad-modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ad-modal-head">
              <span className="ad-modal-title">
                {editingId ? "Edit product" : "Add product"}
              </span>
              <button
                type="button"
                className="ad-modal-close"
                onClick={closeModal}
              >
                ✕
              </button>
            </div>
            <form className="ad-modal-body" onSubmit={saveDraft} noValidate>
              <div className="ad-section-label">Basic info</div>
              <div className="ad-field">
                <label className="ad-label">Product name</label>
                <input
                  className="ad-input"
                  value={draft.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setDraft((prev) => ({
                      ...prev,
                      name,
                      slug: slugify(name),
                    }));
                  }}
                />
                {errors.name && (
                  <div className="ad-error-text">{errors.name}</div>
                )}
              </div>
              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">SKU</label>
                  <input
                    className="ad-input"
                    placeholder="Enter SKU"
                    value={draft.sku}
                    onChange={(e) => setField("sku", e.target.value)}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Category</label>
                  <select
                    className="ad-select"
                    value={draft.category}
                    onChange={(e) => setField("category", e.target.value)}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">Sub-category</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. Hydraulic Double Cylinder"
                    value={draft.subCategory}
                    onChange={(e) => setField("subCategory", e.target.value)}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Machine type</label>
                  <select
                    className="ad-select"
                    value={draft.machineType}
                    onChange={(e) => setField("machineType", e.target.value)}
                  >
                    <option value="">Select type</option>
                    {MACHINE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ad-field">
                <label className="ad-label">Description</label>
                <textarea
                  className="ad-input ad-textarea"
                  rows={3}
                  value={draft.description}
                  onChange={(e) => setField("description", e.target.value)}
                />
              </div>

              <div className="ad-section-label">SEO</div>
              <div className="ad-field">
                <label className="ad-label">Page title</label>
                <input
                  className="ad-input"
                  placeholder="Enter page title"
                  value={draft.pageTitle}
                  onChange={(e) => setField("pageTitle", e.target.value)}
                />
              </div>
              <div className="ad-field">
                <label className="ad-label">Meta description</label>
                <textarea
                  className="ad-input ad-textarea"
                  rows={3}
                  placeholder="Enter a short meta description"
                  value={draft.metaDescription}
                  onChange={(e) => setField("metaDescription", e.target.value)}
                />
              </div>
              <div className="ad-field">
                <label className="ad-label">Meta keywords</label>
                <input
                  className="ad-input"
                  placeholder="machine, paper plate, india"
                  value={draft.metaKeywords}
                  onChange={(e) => setField("metaKeywords", e.target.value)}
                />
              </div>

              <div className="ad-section-label">Product images</div>
              <div
                className={`ad-dropzone ${isDragActive ? "active" : ""}`}
                {...getRootProps()}
              >
                <input {...getInputProps()} />
                <p>
                  {isDragActive
                    ? "Drop the images here…"
                    : "Drag and drop one or more images here, or click to select files."}
                </p>
              </div>
              {Object.keys(uploading).length > 0 && (
                <div className="ad-uploading-note">
                  Uploading {Object.keys(uploading).length} image(s)…
                </div>
              )}
              {draft.images?.length > 0 && (
                <div className="ad-image-grid">
                  {draft.images.map((image, index) => (
                    <div className="ad-image-thumb" key={`${image}-${index}`}>
                      <img src={image} alt={`Product ${index + 1}`} />
                      {uploading[image] && (
                        <div className="ad-image-uploading">Uploading…</div>
                      )}
                      <button
                        type="button"
                        className="ad-image-remove"
                        onClick={() => removeImage(index)}
                        disabled={!!uploading[image]}
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="ad-section-label">Carousel slider</div>
              <div className="ad-row2">
                <div className="ad-field ad-field-checkbox">
                  <label className="ad-label">
                    <input
                      type="checkbox"
                      checked={draft.slider}
                      onChange={(e) => setField("slider", e.target.checked)}
                    />
                    Show in carousel
                  </label>
                </div>
                {/* {draft.slider && (
                  <div className="ad-field">
                    <label className="ad-label">Slider image</label>
                    <input
                      type="file"
                      className="ad-input"
                      onChange={(e) => setField("sliderImage", e.target.files[0])}
                    />
                  </div>
                )} */}
                {/* add slider input */}
                <div className="ad-field">
                  <label className="ad-label">Slider image</label>
                  <input
                    type="file"
                    className="ad-input"
                    onChange={(e) => handleSliderImageUpload(e.target.files[0])}
                  />
                  {sliderUploading && (
                    <div className="ad-uploading-note">
                      Uploading slider image…
                    </div>
                  )}
                </div>
              </div>
              <div className="ad-section-label">Video</div>
              <div className="ad-row2">
                <div className="ad-field ad-field-checkbox">
                  <label className="ad-label">
                    <input
                      type="checkbox"
                      checked={draft.video}
                      onChange={(e) => setField("video", e.target.checked)}
                    />
                    Show product video
                  </label>
                </div>
              </div>

              <div className="ad-field">
                <label className="ad-label">Video link</label>
                <input
                  type="url"
                  className="ad-input"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={draft.video_link}
                  onChange={(e) => setField("video_link", e.target.value)}
                />
                <div className="ad-helper-text">
                  Paste a YouTube link or direct video URL.
                </div>
              </div>

              <div className="ad-section-label">Specifications</div>
              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">Production capacity</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. 15000 pieces in 10 hours"
                    value={draft.specifications.productionCapacity}
                    onChange={(e) =>
                      setSpec("productionCapacity", e.target.value)
                    }
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Motor</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. 0.5 HP"
                    value={draft.specifications.motor}
                    onChange={(e) => setSpec("motor", e.target.value)}
                  />
                </div>
              </div>

              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">Total power</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. 2 KW"
                    value={draft.specifications.totalPower}
                    onChange={(e) => setSpec("totalPower", e.target.value)}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Power source</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. 220V 50Hz"
                    value={draft.specifications.powerSource}
                    onChange={(e) => setSpec("powerSource", e.target.value)}
                  />
                </div>
              </div>

              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">Voltage</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. 220V"
                    value={draft.specifications.voltage}
                    onChange={(e) => setSpec("voltage", e.target.value)}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Phase</label>
                  <select
                    className="ad-select"
                    value={draft.specifications.phase}
                    onChange={(e) => setSpec("phase", e.target.value)}
                  >
                    <option value="">Select phase</option>
                    <option value="Single">Single</option>
                    <option value="Three">Three</option>
                  </select>
                </div>
              </div>

              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">Weight</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. 200 KG"
                    value={draft.specifications.weight}
                    onChange={(e) => setSpec("weight", e.target.value)}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Raw material</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. 80 GSM to 200 GSM"
                    value={draft.specifications.rawMaterial}
                    onChange={(e) => setSpec("rawMaterial", e.target.value)}
                  />
                </div>
              </div>

              <div className="ad-field">
                <label className="ad-label">Dimensions (L × W × H)</label>
                <div className="ad-row3">
                  <input
                    className="ad-input"
                    type="number"
                    min="0"
                    placeholder="Length"
                    value={draft.specifications.dimensions.length}
                    onChange={(e) => setDimension("length", e.target.value)}
                  />
                  <input
                    className="ad-input"
                    type="number"
                    min="0"
                    placeholder="Width"
                    value={draft.specifications.dimensions.width}
                    onChange={(e) => setDimension("width", e.target.value)}
                  />
                  <input
                    className="ad-input"
                    type="number"
                    min="0"
                    placeholder="Height"
                    value={draft.specifications.dimensions.height}
                    onChange={(e) => setDimension("height", e.target.value)}
                  />
                  <select
                    className="ad-select ad-unit-select"
                    value={draft.specifications.dimensions.unit}
                    onChange={(e) => setDimension("unit", e.target.value)}
                  >
                    <option value="inch">inch</option>
                    <option value="mm">mm</option>
                    <option value="cm">cm</option>
                  </select>
                </div>
              </div>

              <div className="ad-section-label">Catalog content</div>
              <ChipInput
                label="Items produced"
                placeholder="e.g. Fancy Thali — press Enter"
                values={draft.itemsProduced}
                onChange={(value) => setField("itemsProduced", value)}
              />
              <ChipInput
                label="Special features"
                placeholder="e.g. Easy maintenance — press Enter"
                values={draft.features}
                onChange={(value) => setField("features", value)}
              />
              <ChipInput
                label="Tags"
                placeholder="e.g. dona machine — press Enter"
                values={draft.tags}
                onChange={(value) => setField("tags", value)}
              />

              <div className="ad-section-label">Pricing</div>
              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">Base price</label>
                  <input
                    className="ad-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.pricing.basePrice}
                    onChange={(e) => setPricing("basePrice", e.target.value)}
                  />
                  {errors.basePrice && (
                    <div className="ad-error-text">{errors.basePrice}</div>
                  )}
                </div>
                <div className="ad-field">
                  <label className="ad-label">Price label</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. Gurgaon Price"
                    value={draft.pricing.priceLabel}
                    onChange={(e) => setPricing("priceLabel", e.target.value)}
                  />
                </div>
              </div>

              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">Other expenses</label>
                  <input
                    className="ad-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={draft.pricing.otherExpenses}
                    onChange={(e) =>
                      setPricing("otherExpenses", e.target.value)
                    }
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Total price (auto)</label>
                  <input
                    className="ad-input"
                    value={totalPriceDisplay}
                    disabled
                    readOnly
                  />
                </div>
              </div>

              <div className="ad-section-label">Logistics & stock</div>
              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">Stock qty</label>
                  <input
                    className="ad-input"
                    type="number"
                    min="0"
                    value={draft.stock}
                    onChange={(e) => setField("stock", e.target.value)}
                  />
                  {errors.stock && (
                    <div className="ad-error-text">{errors.stock}</div>
                  )}
                </div>
                <div className="ad-field">
                  <label className="ad-label">Low-stock threshold</label>
                  <input
                    className="ad-input"
                    type="number"
                    min="0"
                    value={draft.threshold}
                    onChange={(e) => setField("threshold", e.target.value)}
                  />
                </div>
              </div>

              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">Warranty</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. 12 Months"
                    value={draft.warranty}
                    onChange={(e) => setField("warranty", e.target.value)}
                  />
                </div>
                <div className="ad-field">
                  <label className="ad-label">Delivery time</label>
                  <input
                    className="ad-input"
                    placeholder="e.g. 10 Days"
                    value={draft.deliveryTime}
                    onChange={(e) => setField("deliveryTime", e.target.value)}
                  />
                </div>
              </div>

              <div className="ad-row2">
                <div className="ad-field">
                  <label className="ad-label">Availability</label>
                  <select
                    className="ad-select"
                    value={draft.availability}
                    onChange={(e) => setField("availability", e.target.value)}
                  >
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="ad-field">
                  <label className="ad-label">Status</label>
                  <select
                    className="ad-select"
                    value={draft.status}
                    onChange={(e) => setField("status", e.target.value)}
                  >
                    {STATUS_OPTIONS.map((value) => (
                      <option key={value} value={value}>
                        {value}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ad-row2 ad-row-gap-small">
                <div className="ad-field">
                  <label className="ad-label">Main market</label>
                  <input
                    className="ad-input"
                    value={draft.mainMarket}
                    onChange={(e) => setField("mainMarket", e.target.value)}
                  />
                </div>
                <div className="ad-field ad-checkbox-field">
                  <label className="ad-label">Returnable</label>
                  <label className="ad-checkbox-row">
                    <input
                      type="checkbox"
                      checked={draft.isReturnable}
                      onChange={(e) =>
                        setField("isReturnable", e.target.checked)
                      }
                    />
                    <span>Item can be returned</span>
                  </label>
                </div>
              </div>

              {submitError && (
                <div className="ad-error-text ad-submit-error">
                  {submitError}
                </div>
              )}

              <div className="ad-modal-actions">
                <button
                  type="button"
                  className="ad-btn-secondary"
                  onClick={closeModal}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="ad-btn-primary"
                  disabled={isSubmitting || Object.keys(uploading).length > 0}
                >
                  {isSubmitting
                    ? "Saving…"
                    : editingId
                      ? "Save changes"
                      : "Add product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

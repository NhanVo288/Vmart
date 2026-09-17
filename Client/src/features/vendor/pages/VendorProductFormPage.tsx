import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import { LoadingSkeleton } from "../../../components/ui/LoadingSkeleton";
import IconButton from "@mui/material/IconButton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useGetProductByIdQuery } from "../../../stores/productApi";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
} from "../../../stores/adminApi";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce
    .number()
    .refine((v) => !isNaN(v), "Price is required")
    .min(0.01, "Must be at least 0.01"),
  brand: z.string().min(1, "Brand is required"),
  type: z.string().min(1, "Type is required"),
  quantityInStock: z.coerce
    .number()
    .refine((v) => !isNaN(v), "Stock is required")
    .min(0, "Cannot be negative"),
});

type FormValues = z.infer<typeof productSchema>;

export function VendorProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { data: existingProduct, isLoading: loadingProduct } =
    useGetProductByIdQuery(Number(id), { skip: !isEdit });
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(productSchema) as Resolver<FormValues>,
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      brand: "",
      type: "",
      quantityInStock: 0,
    },
  });

  useEffect(() => {
    if (existingProduct) {
      reset({
        name: existingProduct.name,
        description: existingProduct.description,
        price: existingProduct.price,
        brand: existingProduct.brand,
        type: existingProduct.type,
        quantityInStock: existingProduct.quantityInStock,
      });
      setImagePreview(existingProduct.pictureUrl);
    }
  }, [existingProduct, reset]);

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    },
    [],
  );

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        const formData = new FormData();
        formData.append("Name", values.name);
        formData.append("Description", values.description);
        formData.append("Price", String(values.price));
        formData.append("Brand", values.brand);
        formData.append("Type", values.type);
        formData.append("QuantityInStock", String(values.quantityInStock));
        if (imageFile) {
          formData.append("Image", imageFile);
        }
        if (isEdit) {
          await updateProduct({ id: Number(id), formData }).unwrap();
        } else {
          await createProduct(formData).unwrap();
        }
        navigate("/vendor/products");
      } catch {}
    },
    [imageFile, isEdit, id, createProduct, updateProduct, navigate],
  );

  const isSaving = isCreating || isUpdating;

  if (isEdit && loadingProduct) return <LoadingSkeleton variant="form" />;

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 3,
        }}
      >
        <IconButton onClick={() => navigate("/vendor/products")}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {isEdit ? "Edit Product" : "New Product"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isEdit
              ? "Update product details and images"
              : "Add a new product to your inventory"}
          </Typography>
        </Box>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 2, p: 3 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "1",
                    maxWidth: 280,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "2px dashed",
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "action.hover",
                    cursor: "pointer",
                    position: "relative",
                  }}
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                >
                  {imagePreview ? (
                    <Box
                      component="img"
                      src={imagePreview}
                      alt="Preview"
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Box sx={{ textAlign: "center", p: 2 }}>
                      <CloudUploadIcon
                        sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Click to upload image
                      </Typography>
                    </Box>
                  )}
                </Box>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleImageChange}
                />
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUploadIcon />}
                  onClick={() =>
                    document.getElementById("image-upload")?.click()
                  }
                  sx={{ borderRadius: 2, textTransform: "none" }}
                >
                  {imageFile ? "Change Image" : "Upload Image"}
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={2.5}>
                <Grid size={12}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Product Name"
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Description"
                        fullWidth
                        multiline
                        rows={4}
                        error={!!errors.description}
                        helperText={errors.description?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Price"
                        type="number"
                        fullWidth
                        slotProps={{ input: { startAdornment: "VND" } }}
                        error={!!errors.price}
                        helperText={errors.price?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="quantityInStock"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Quantity in Stock"
                        type="number"
                        fullWidth
                        error={!!errors.quantityInStock}
                        helperText={errors.quantityInStock?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="brand"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Brand"
                        fullWidth
                        error={!!errors.brand}
                        helperText={errors.brand?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        label="Type"
                        fullWidth
                        error={!!errors.type}
                        helperText={errors.type?.message}
                        sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2 } }}
                      />
                    )}
                  />
                </Grid>

                <Grid size={12}>
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      justifyContent: "flex-end",
                      pt: 2,
                      borderTop: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Button
                      variant="outlined"
                      onClick={() => navigate("/vendor/products")}
                      sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSaving}
                      startIcon={
                        isSaving ? <CircularProgress size={16} /> : undefined
                      }
                      sx={{ borderRadius: 2, textTransform: "none", px: 4 }}
                    >
                      {isEdit ? "Update Product" : "Create Product"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}

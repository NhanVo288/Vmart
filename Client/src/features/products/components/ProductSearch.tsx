import Box from "@mui/material/Box";
import { SearchAutocomplete } from "../../../components/ui/SearchAutocomplete";
import { useTranslation } from "../../../lib/i18n";

interface ProductSearchProps {
  onSearch: (searchTerm: string) => void;
  initialValue?: string;
}

export function ProductSearch({ onSearch, initialValue = "" }: ProductSearchProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: "flex", justifyContent: "center", width: "100%", px: { xs: 2, sm: 4, md: 0 } }}>
      <Box sx={{ width: "100%", maxWidth: { xs: "100%", sm: 500, md: 560 } }}>
        <SearchAutocomplete
          onSearch={onSearch}
          initialValue={initialValue}
          placeholder={t("searchProductsPlaceholder")}
        />
      </Box>
    </Box>
  );
}

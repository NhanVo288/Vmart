import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useGetProductsQuery } from "../../stores/productApi";
import { SearchDropdownItem } from "../../features/products/components/SearchDropdownItem";
import type { IProduct } from "../../types/product";

interface SearchAutocompleteProps {
  onSearch: (term: string) => void;
  compact?: boolean;
  placeholder?: string;
  initialValue?: string;
}

export function SearchAutocomplete({ onSearch, compact, placeholder, initialValue = "" }: SearchAutocompleteProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState(initialValue);
  const [debouncedQuery, setDebouncedQuery] = useState(initialValue);

  useEffect(() => {
    setInputValue(initialValue);
    setDebouncedQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(inputValue.trim()), 250);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data, isFetching } = useGetProductsQuery(
    debouncedQuery ? { searchTerm: debouncedQuery, orderBy: "Name", ascending: true } : undefined,
    { skip: !debouncedQuery }
  );
  const suggestions = data?.items ?? [];

  return (
    <Autocomplete
      freeSolo
      disableClearable
      fullWidth
      filterOptions={(x) => x}
      options={suggestions}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onChange={(_, value) => {
        if (!value) return;
        if (typeof value === "object" && "id" in value) {
          navigate(`/items/${(value as IProduct).id}`);
          setInputValue("");
        } else if (typeof value === "string" && value.trim()) {
          onSearch(value.trim());
          setInputValue("");
        }
      }}
      getOptionLabel={(option) =>
        typeof option === "string" ? option : option.name
      }
      isOptionEqualToValue={(option, val) =>
        typeof val === "string"
          ? (option as IProduct).name === val
          : (option as IProduct).id === (val as IProduct).id
      }
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <Box
            component="li"
            key={typeof option === "string" ? option : (option as IProduct).id}
            {...rest}
            sx={{ px: 2, py: 1, "&:hover": { bgcolor: "action.hover" } }}
          >
            {typeof option === "string" ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
                <span>{option}</span>
              </Box>
            ) : (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                <SearchDropdownItem product={option as IProduct} />
                <OpenInNewIcon sx={{ fontSize: 16, color: "text.disabled", flexShrink: 0 }} />
              </Box>
            )}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={placeholder ?? (compact ? "Search…" : "Search products…")}
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputValue.trim()) {
              onSearch(inputValue.trim());
              setInputValue("");
            }
          }}
          slotProps={{
            ...params.slotProps,
            input: {
              ...params.slotProps?.input,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ fontSize: compact ? 18 : 20, color: "text.disabled" }} />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {isFetching && debouncedQuery ? <CircularProgress color="inherit" size={compact ? 16 : 20} /> : null}
                  {inputValue ? (
                    <IconButton size="small" onClick={() => { setInputValue(""); onSearch(""); }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: 3,
              fontSize: compact ? "0.85rem" : "0.95rem",
              transition: "all 0.3s ease",
            },
          }}
        />
      )}
      noOptionsText={
        inputValue.trim()
          ? `Press Enter to search for "${inputValue}"`
          : "Start typing to search…"
      }
    />
  );
}

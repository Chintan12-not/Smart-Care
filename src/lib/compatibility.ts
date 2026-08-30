import { AccessoryProduct } from "./accessories";

// List of phone model variant modifiers that require strict boundary isolation
const VARIANT_MODIFIERS = ["pro max", "pro", "plus", "ultra", "mini", "fe", "5g", "lite", "neo", "play"];

/**
 * Exact compatibility engine for smartphone accessories.
 * Guarantees that selecting a model like "iPhone 15" does NOT show "iPhone 15 Pro" or "iPhone 15 Pro Max"
 * unless the product explicitly specifies compatibility with both.
 */
export function isProductCompatibleWithModel(
  product: AccessoryProduct,
  selectedBrand: string,
  selectedModel: string
): boolean {
  const normBrand = (selectedBrand || "").toLowerCase().trim();
  const normModel = (selectedModel || "").toLowerCase().trim();

  // If no brand or model selected, all products are eligible
  if (!normBrand && !normModel) return true;

  const prodBrand = (product.brand || "").toLowerCase().trim();
  const prodCategory = (product.category || "").toLowerCase().trim();
  const prodName = (product.name || "").toLowerCase().trim();
  const prodSpecs = product.specifications ? JSON.stringify(product.specifications).toLowerCase() : "";
  const prodCorpus = `${prodName} ${prodBrand} ${prodCategory} ${prodSpecs} ${(product.description || "").toLowerCase()}`;

  // 1. BRAND LEVEL CHECK
  if (normBrand) {
    const isGenericBrand = prodBrand === "generic" || prodBrand === "universal" || prodBrand === "all";
    const brandMatches = 
      prodBrand === normBrand ||
      prodBrand.includes(normBrand) ||
      prodCorpus.includes(normBrand) ||
      (normBrand === "apple" && (prodBrand === "airpods" || prodCorpus.includes("iphone") || prodCorpus.includes("ipad"))) ||
      (normBrand === "airpods" && (prodBrand === "apple" || prodCorpus.includes("airpod")));

    // Universal categories (chargers, cables, power banks, earbuds) match across brand if generic
    const isUniversalCategory = 
      prodCategory.includes("charger") ||
      prodCategory.includes("cable") ||
      prodCategory.includes("power") ||
      prodCategory.includes("earbud") ||
      prodCategory.includes("adapter");

    if (!brandMatches && !isGenericBrand && !isUniversalCategory) {
      return false;
    }
  }

  // 2. MODEL LEVEL CHECK (if model is specified)
  if (!normModel) {
    return true; // Only brand filter was active
  }

  // Universal accessories (chargers, wall adapters, power banks, audio cables) match all models of that brand
  const isUniversalAccessory = 
    prodCategory.includes("charger") ||
    prodCategory.includes("cable") ||
    prodCategory.includes("power") ||
    prodCategory.includes("earbud") ||
    prodSpecs.includes("universal") ||
    prodSpecs.includes("all models");

  if (isUniversalAccessory) {
    return true;
  }

  // 3. EXACT MODEL MATCHING & VARIANT ISOLATION
  // Determine which variant modifiers exist in the selected model
  const selectedModifiers = VARIANT_MODIFIERS.filter(mod => normModel.includes(mod));
  
  // Extract core model token (e.g. "iphone 15" from "iphone 15 pro max", "s24" from "galaxy s24 ultra")
  const cleanSelectedModel = normModel;

  // Does product corpus contain the selected model?
  const containsModelString = prodCorpus.includes(cleanSelectedModel);

  if (!containsModelString) {
    // Check if specifications has "Compatible Phone Models" array or list
    const compModelsSpec = (product.specifications?.["Compatible Phone Models"] || "").toLowerCase();
    if (!compModelsSpec.includes(cleanSelectedModel)) {
      return false;
    }
  }

  // Strict Modifier Isolation:
  // If product mentions a variant modifier (e.g. "pro max", "ultra") NOT present in the selected model,
  // ensure the product explicitly lists the base/selected model separately.
  for (const mod of VARIANT_MODIFIERS) {
    const selectedHasMod = selectedModifiers.includes(mod);
    const prodHasMod = prodCorpus.includes(mod);

    if (prodHasMod && !selectedHasMod) {
      // E.g., Product has "pro", but selected model is "iPhone 15" (no "pro")
      // Check if product explicitly lists the base model without the modifier
      // E.g. "iPhone 15, iPhone 15 Pro" vs "iPhone 15 Pro Case"
      const compModelsSpec = (product.specifications?.["Compatible Phone Models"] || "").toLowerCase();
      
      // Look for standalone mention of selectedModel in title or specs
      const regexStandalone = new RegExp(`\\b${escapeRegExp(cleanSelectedModel)}\\b(?!\\s+${escapeRegExp(mod)})`, 'i');
      const isStandaloneInTitle = regexStandalone.test(prodName);
      const isStandaloneInSpec = regexStandalone.test(compModelsSpec);

      if (!isStandaloneInTitle && !isStandaloneInSpec) {
        return false; // Product is specifically for a variant model (e.g. Pro/Ultra)
      }
    }
  }

  return true;
}

function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

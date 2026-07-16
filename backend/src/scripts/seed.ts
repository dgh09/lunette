import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
  updateStoresStep,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => ({
              currency_code: currency.currency_code,
              is_default: currency.is_default ?? false,
            })
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);
    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["co", "us", "mx", "ar", "cl", "pe"];

  // Store & Sales Channel
  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [{ name: "Default Sales Channel" }],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        { currency_code: "usd", is_default: true },
        { currency_code: "cop" },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_sales_channel_id: defaultSalesChannel[0].id },
    },
  });

  // Region
  logger.info("Seeding region data...");
  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Americas",
          currency_code: "usd",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  // Tax regions
  logger.info("Seeding tax regions...");
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  });
  logger.info("Finished seeding tax regions.");

  // Stock location
  logger.info("Seeding stock location data...");
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Lunette Warehouse",
          address: {
            city: "Bogotá",
            country_code: "CO",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: { default_location_id: stockLocation.id },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  });

  // Shipping
  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [{ name: "Default Shipping Profile", type: "default" }],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "Lunette Delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Americas",
        geo_zones: countries.map((country_code) => ({
          country_code,
          type: "country" as const,
        })),
      },
    ],
  });

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocation.id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Envío Estándar",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: { label: "Estándar", description: "Entrega en 3-5 días hábiles.", code: "standard" },
        prices: [
          { currency_code: "usd", amount: 800 },
          { region_id: region.id, amount: 800 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
      {
        name: "Envío Express",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: { label: "Express", description: "Entrega en 1-2 días hábiles.", code: "express" },
        prices: [
          { currency_code: "usd", amount: 1500 },
          { region_id: region.id, amount: 1500 },
        ],
        rules: [
          { attribute: "enabled_in_store", value: "true", operator: "eq" },
          { attribute: "is_return", value: "false", operator: "eq" },
        ],
      },
    ],
  });

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: { id: stockLocation.id, add: [defaultSalesChannel[0].id] },
  });
  logger.info("Finished seeding fulfillment data.");

  // Publishable API Key
  logger.info("Seeding publishable API key...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: { type: "publishable" },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const { result: [publishableApiKeyResult] } = await createApiKeysWorkflow(
      container
    ).run({
      input: {
        api_keys: [{ title: "Lunette Storefront", type: "publishable", created_by: "" }],
      },
    });
    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: { id: publishableApiKey.id, add: [defaultSalesChannel[0].id] },
  });
  logger.info("Finished seeding publishable API key.");

  // Product Categories
  logger.info("Seeding product categories...");
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        { name: "Tops", handle: "tops", is_active: true },
        { name: "Bodies", handle: "bodies", is_active: true },
        { name: "Jeans", handle: "jeans", is_active: true },
        { name: "Camisetas", handle: "camisetas", is_active: true },
        { name: "Faldas", handle: "faldas", is_active: true },
      ],
    },
  });
  logger.info("Finished seeding categories.");

  // Products
  logger.info("Seeding Lunette products...");

  const salesChannel = [{ id: defaultSalesChannel[0].id }];

  await createProductsWorkflow(container).run({
    input: {
      products: [
        // Cherry Top
        {
          title: "Cherry Top",
          handle: "cherry-top",
          description: "Top cropped con bordado de cereza y copa martini. Tela acanalada, ajustado al cuerpo. El top más icónico de la colección Summer Calls.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [categoryResult.find((c) => c.name === "Tops")!.id],
          images: [
            { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800" },
          ],
          thumbnail: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600",
          options: [
            { title: "Talla", values: ["XS", "S", "M", "L"] },
            { title: "Color", values: ["Crema"] },
          ],
          variants: [
            { title: "XS / Crema", sku: "CHT-XS-CRE", options: { Talla: "XS", Color: "Crema" }, prices: [{ amount: 34900, currency_code: "usd" }] },
            { title: "S / Crema", sku: "CHT-S-CRE", options: { Talla: "S", Color: "Crema" }, prices: [{ amount: 34900, currency_code: "usd" }] },
            { title: "M / Crema", sku: "CHT-M-CRE", options: { Talla: "M", Color: "Crema" }, prices: [{ amount: 34900, currency_code: "usd" }] },
            { title: "L / Crema", sku: "CHT-L-CRE", options: { Talla: "L", Color: "Crema" }, prices: [{ amount: 34900, currency_code: "usd" }] },
          ],
          sales_channels: salesChannel,
        },

        // Butter Body
        {
          title: "Butter Body",
          handle: "butter-body",
          description: "Body manga larga con detalle de abertura circular en la espalda. Tela suave y elástica que se adapta perfectamente al cuerpo. Colección Summer Calls.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [categoryResult.find((c) => c.name === "Bodies")!.id],
          images: [
            { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800" },
            { url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800" },
          ],
          thumbnail: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600",
          options: [
            { title: "Talla", values: ["XS", "S", "M", "L"] },
            { title: "Color", values: ["Amarillo"] },
          ],
          variants: [
            { title: "XS / Amarillo", sku: "BTB-XS-AMA", options: { Talla: "XS", Color: "Amarillo" }, prices: [{ amount: 44900, currency_code: "usd" }] },
            { title: "S / Amarillo", sku: "BTB-S-AMA", options: { Talla: "S", Color: "Amarillo" }, prices: [{ amount: 44900, currency_code: "usd" }] },
            { title: "M / Amarillo", sku: "BTB-M-AMA", options: { Talla: "M", Color: "Amarillo" }, prices: [{ amount: 44900, currency_code: "usd" }] },
            { title: "L / Amarillo", sku: "BTB-L-AMA", options: { Talla: "L", Color: "Amarillo" }, prices: [{ amount: 44900, currency_code: "usd" }] },
          ],
          sales_channels: salesChannel,
        },

        // Brownie Body
        {
          title: "Brownie Body",
          handle: "brownie-body",
          description: "Body manga larga con abertura circular en la espalda, en color marrón chocolate. Misma silueta que el Butter Body en un tono más oscuro y versátil.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [categoryResult.find((c) => c.name === "Bodies")!.id],
          images: [
            { url: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=800" },
          ],
          thumbnail: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=600",
          options: [
            { title: "Talla", values: ["XS", "S", "M", "L"] },
            { title: "Color", values: ["Marrón"] },
          ],
          variants: [
            { title: "XS / Marrón", sku: "BWB-XS-MAR", options: { Talla: "XS", Color: "Marrón" }, prices: [{ amount: 44900, currency_code: "usd" }] },
            { title: "S / Marrón", sku: "BWB-S-MAR", options: { Talla: "S", Color: "Marrón" }, prices: [{ amount: 44900, currency_code: "usd" }] },
            { title: "M / Marrón", sku: "BWB-M-MAR", options: { Talla: "M", Color: "Marrón" }, prices: [{ amount: 44900, currency_code: "usd" }] },
            { title: "L / Marrón", sku: "BWB-L-MAR", options: { Talla: "L", Color: "Marrón" }, prices: [{ amount: 44900, currency_code: "usd" }] },
          ],
          sales_channels: salesChannel,
        },

        // Sparkle Jean
        {
          title: "Sparkle Jean",
          handle: "sparkle-jean",
          description: "Jean con parches de estrella roja bordada en los bolsillos traseros. Corte recto, lavado medio. El jean más característico de Lunette.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [categoryResult.find((c) => c.name === "Jeans")!.id],
          images: [
            { url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800" },
            { url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800" },
          ],
          thumbnail: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600",
          options: [
            { title: "Talla", values: ["XS", "S", "M", "L"] },
            { title: "Color", values: ["Azul"] },
          ],
          variants: [
            { title: "XS / Azul", sku: "SPJ-XS-AZU", options: { Talla: "XS", Color: "Azul" }, prices: [{ amount: 69900, currency_code: "usd" }] },
            { title: "S / Azul", sku: "SPJ-S-AZU", options: { Talla: "S", Color: "Azul" }, prices: [{ amount: 69900, currency_code: "usd" }] },
            { title: "M / Azul", sku: "SPJ-M-AZU", options: { Talla: "M", Color: "Azul" }, prices: [{ amount: 69900, currency_code: "usd" }] },
            { title: "L / Azul", sku: "SPJ-L-AZU", options: { Talla: "L", Color: "Azul" }, prices: [{ amount: 69900, currency_code: "usd" }] },
          ],
          sales_channels: salesChannel,
        },

        // Sparkle Black Jean
        {
          title: "Sparkle Black Jean",
          handle: "sparkle-black-jean",
          description: "Jean negro con parche de estrella roja en el bolsillo trasero. Corte recto en denim negro. La versión oscura del icónico Sparkle Jean.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [categoryResult.find((c) => c.name === "Jeans")!.id],
          images: [
            { url: "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800" },
          ],
          thumbnail: "https://images.unsplash.com/photo-1475178626620-a4d074967452?w=600",
          options: [
            { title: "Talla", values: ["XS", "S", "M", "L"] },
            { title: "Color", values: ["Negro"] },
          ],
          variants: [
            { title: "XS / Negro", sku: "SPBJ-XS-NEG", options: { Talla: "XS", Color: "Negro" }, prices: [{ amount: 69900, currency_code: "usd" }] },
            { title: "S / Negro", sku: "SPBJ-S-NEG", options: { Talla: "S", Color: "Negro" }, prices: [{ amount: 69900, currency_code: "usd" }] },
            { title: "M / Negro", sku: "SPBJ-M-NEG", options: { Talla: "M", Color: "Negro" }, prices: [{ amount: 69900, currency_code: "usd" }] },
            { title: "L / Negro", sku: "SPBJ-L-NEG", options: { Talla: "L", Color: "Negro" }, prices: [{ amount: 69900, currency_code: "usd" }] },
          ],
          sales_channels: salesChannel,
        },

        // Camiseta Lunette
        {
          title: "Camiseta Lunette",
          handle: "camiseta-lunette",
          description: "Camiseta oversize con el logo Lunette estampado en la espalda. Disponible en blanco, marrón y negro. La pieza más versátil de la marca.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [categoryResult.find((c) => c.name === "Camisetas")!.id],
          images: [
            { url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800" },
            { url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800" },
          ],
          thumbnail: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600",
          options: [
            { title: "Talla", values: ["XS", "S", "M", "L"] },
            { title: "Color", values: ["Blanco", "Marrón", "Negro"] },
          ],
          variants: [
            { title: "XS / Blanco", sku: "LUN-XS-BLA", options: { Talla: "XS", Color: "Blanco" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "S / Blanco", sku: "LUN-S-BLA", options: { Talla: "S", Color: "Blanco" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "M / Blanco", sku: "LUN-M-BLA", options: { Talla: "M", Color: "Blanco" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "L / Blanco", sku: "LUN-L-BLA", options: { Talla: "L", Color: "Blanco" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "XS / Marrón", sku: "LUN-XS-MAR", options: { Talla: "XS", Color: "Marrón" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "S / Marrón", sku: "LUN-S-MAR", options: { Talla: "S", Color: "Marrón" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "M / Marrón", sku: "LUN-M-MAR", options: { Talla: "M", Color: "Marrón" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "L / Marrón", sku: "LUN-L-MAR", options: { Talla: "L", Color: "Marrón" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "XS / Negro", sku: "LUN-XS-NEG", options: { Talla: "XS", Color: "Negro" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "S / Negro", sku: "LUN-S-NEG", options: { Talla: "S", Color: "Negro" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "M / Negro", sku: "LUN-M-NEG", options: { Talla: "M", Color: "Negro" }, prices: [{ amount: 39900, currency_code: "usd" }] },
            { title: "L / Negro", sku: "LUN-L-NEG", options: { Talla: "L", Color: "Negro" }, prices: [{ amount: 39900, currency_code: "usd" }] },
          ],
          sales_channels: salesChannel,
        },

        // Salty Skirt
        {
          title: "Salty Skirt",
          handle: "salty-skirt",
          description: "Mini falda con volados en tela bordada blanca. Diseño romántico y fresco, ideal para la temporada de verano. Parte de la colección Summer Calls.",
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          category_ids: [categoryResult.find((c) => c.name === "Faldas")!.id],
          images: [
            { url: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800" },
          ],
          thumbnail: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600",
          options: [
            { title: "Talla", values: ["XS", "S", "M", "L"] },
            { title: "Color", values: ["Blanco"] },
          ],
          variants: [
            { title: "XS / Blanco", sku: "SSK-XS-BLA", options: { Talla: "XS", Color: "Blanco" }, prices: [{ amount: 49900, currency_code: "usd" }] },
            { title: "S / Blanco", sku: "SSK-S-BLA", options: { Talla: "S", Color: "Blanco" }, prices: [{ amount: 49900, currency_code: "usd" }] },
            { title: "M / Blanco", sku: "SSK-M-BLA", options: { Talla: "M", Color: "Blanco" }, prices: [{ amount: 49900, currency_code: "usd" }] },
            { title: "L / Blanco", sku: "SSK-L-BLA", options: { Talla: "L", Color: "Blanco" }, prices: [{ amount: 49900, currency_code: "usd" }] },
          ],
          sales_channels: salesChannel,
        },
      ],
    },
  });
  logger.info("Finished seeding products.");

  // Inventory levels
  logger.info("Seeding inventory levels...");
  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = inventoryItems.map(
    (item) => ({
      location_id: stockLocation.id,
      stocked_quantity: 50,
      inventory_item_id: item.id,
    })
  );

  await createInventoryLevelsWorkflow(container).run({
    input: { inventory_levels: inventoryLevels },
  });
  logger.info("Finished seeding inventory levels.");

  logger.info("✓ Lunette seed completado.");
  logger.info(`✓ Publishable API Key: ${publishableApiKey.id}`);
}

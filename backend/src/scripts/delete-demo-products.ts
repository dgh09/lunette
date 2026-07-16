import { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { deleteProductsWorkflow } from "@medusajs/medusa/core-flows";

export default async function deleteDemoProducts({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModuleService = container.resolve(Modules.PRODUCT);

  const demoHandles = ["t-shirt", "sweatshirt", "sweatpants", "shorts"];

  logger.info("Buscando productos demo de Medusa...");

  const products = await productModuleService.listProducts({
    handle: demoHandles,
  });

  if (!products.length) {
    logger.info("No se encontraron productos demo.");
    return;
  }

  logger.info(`Eliminando ${products.length} productos demo...`);

  await deleteProductsWorkflow(container).run({
    input: { ids: products.map((p) => p.id) },
  });

  logger.info("✓ Productos demo eliminados.");
}

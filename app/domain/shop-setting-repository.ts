import type { ShopSetting } from "./shop-settings";

export interface ShopSettingRepository {
  add(shopDomain: string): Promise<ShopSetting>;
  update(shopSetting: ShopSetting): Promise<ShopSetting>;
  findByShopDomain(shopDomain: string): Promise<ShopSetting>;
}

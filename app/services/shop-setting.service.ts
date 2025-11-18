import { ShopSettingRepository } from "app/domain/shop-setting-repository";

export class ShopSettingService {
  private shopSettingRespository: ShopSettingRepository;

  constructor(shopSettingRespository: ShopSettingRepository) {
    this.shopSettingRespository = shopSettingRespository;
  }

  private async getDefaultSystemPrompt(): Promise<string> {
    const shopSettingCustom =
      await this.shopSettingRespository.findByShopDomain("default");

    if (!shopSettingCustom) {
      throw new Error("No default shop found");
    }
    if (!shopSettingCustom.systemPrompt) {
      throw new Error("No system prompt set on default shop");
    }
    return shopSettingCustom.systemPrompt;
  }

  async getSystemPrompt(shopDomain: string): Promise<string> {
    const shopSettingShopCustom =
      await this.shopSettingRespository.findByShopDomain(shopDomain);

    if (!shopSettingShopCustom || !shopSettingShopCustom.systemPrompt) {
      return this.getDefaultSystemPrompt();
    }

    return shopSettingShopCustom.systemPrompt;
  }
}

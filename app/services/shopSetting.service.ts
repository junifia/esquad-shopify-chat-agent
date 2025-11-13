import { ShopSettingRepository } from "app/domain/shop-setting-repository";
import { ShopSetting } from "app/domain/shop-settings";

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
  async getCustomSystemPrompt(shopDomain: string): Promise<string | null> {
    const shopSettingShopCustom =
      await this.shopSettingRespository.findByShopDomain(shopDomain);
    if (!shopSettingShopCustom) {
      throw new Error("Shop setting don't exist");
    }

    if (!shopSettingShopCustom.systemPrompt) {
      return null;
    }

    return shopSettingShopCustom.systemPrompt;
  }

  async saveCustomSystemPrompt(
    shopDomain: string,
    systemPrompt: string,
  ): Promise<ShopSetting> {
    const shopSetting =
      await this.shopSettingRespository.findByShopDomain(shopDomain);

    if (!shopSetting) {
      throw new Error(`shop setting of domain ${shopDomain} not found`);
    }

    if (systemPrompt === "") {
      shopSetting.systemPrompt = null;
    } else {
      shopSetting.systemPrompt = systemPrompt;
    }

    const newShopSetting =
      await this.shopSettingRespository.update(shopSetting);
    if (!newShopSetting) {
      throw new Error("Error whiles saving shop setting");
    }

    return newShopSetting;
  }
}

import { ShopSettingRepository } from "app/domain/shop-setting-repository";
import { ShopSetting } from "app/domain/shop-settings";
import { ShopSettingsNotFound } from "app/domain/shop-settings-not-found-exception";

export class ShopSettingService {
  private shopSettingRepository: ShopSettingRepository;

  private readonly CUSTOM_PROMPT_WRAPPER =
    "Here are the merchant's custom instructions that you must follow: <custom_instructions>{{CUSTOM_SYSTEM_PROMPT}}</custom_instructions>";
  private readonly CUSTOM_PROMPT_PLACEHOLDER = "{{ESQUAD_SHOP_CUSTOM_PROMPT}}";

  constructor(shopSettingRespository: ShopSettingRepository) {
    this.shopSettingRepository = shopSettingRespository;
  }

  async init(shopDomain: string) {
    const systemPrompt = await this.getSetting(shopDomain);
    if (!systemPrompt) {
      await this.addSetting(shopDomain);
    }
  }

  async getDefaultSystemPrompt(): Promise<string> {
    try {
      const defaultShopSettings =
        await this.shopSettingRepository.findByShopDomain("default");

      if (!defaultShopSettings.systemPrompt) {
        throw new Error("No system prompt set on default shop");
      }

      return defaultShopSettings.systemPrompt;
    } catch (error) {
      if (error instanceof ShopSettingsNotFound) {
        throw new Error("No default shop found");
      }

      throw error;
    }
  }

  async getSetting(shopDomain: string): Promise<ShopSetting | null> {
    try {
      const shopSetting =
        await this.shopSettingRepository.findByShopDomain(shopDomain);
      return shopSetting;
    } catch (error) {
      if (error instanceof ShopSettingsNotFound) {
        return null;
      }
      throw error;
    }
  }

  async getSystemPrompt(shopDomain: string): Promise<string> {
    const [shopCustomPrompt, defaultSystemPrompt] = await Promise.all([
      this.getCustomSystemPrompt(shopDomain),
      this.getDefaultSystemPrompt(),
    ]);

    const customPromptSection = shopCustomPrompt
      ? this.generateShopCustomPrompt(shopCustomPrompt)
      : "";

    return defaultSystemPrompt.replace(
      this.CUSTOM_PROMPT_PLACEHOLDER,
      customPromptSection,
    );
  }

  private generateShopCustomPrompt(shopCustomPrompt: string): string {
    return this.CUSTOM_PROMPT_WRAPPER.replace(
      "{{CUSTOM_SYSTEM_PROMPT}}",
      shopCustomPrompt,
    );
  }

  private async getCustomSystemPrompt(
    shopDomain: string,
  ): Promise<string | null> {
    const shopSetting = await this.getSetting(shopDomain);
    if (!shopSetting) {
      return null;
    }
    return shopSetting.systemPrompt || null;
  }

  async saveCustomSystemPrompt(
    shopDomain: string,
    systemPrompt: string,
  ): Promise<ShopSetting> {
    const shopSetting =
      await this.shopSettingRepository.findByShopDomain(shopDomain);

    if (!shopSetting) {
      throw new Error(`shop setting of domain ${shopDomain} not found`);
    }

    shopSetting.systemPrompt = systemPrompt;

    const newShopSetting = await this.shopSettingRepository.update(shopSetting);
    if (!newShopSetting) {
      throw new Error("Error whiles saving shop setting");
    }
    return newShopSetting;
  }

  async addSetting(shopDomain: string): Promise<void> {
    await this.shopSettingRepository.add(shopDomain);
  }
}

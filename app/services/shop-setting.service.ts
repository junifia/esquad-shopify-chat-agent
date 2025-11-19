import { ShopSettingRepository } from "app/domain/shop-setting-repository";
import { ShopSettingsNotFound } from "app/domain/shop-settings-not-found-exception";

export class ShopSettingService {
  private shopSettingRespository: ShopSettingRepository;

  private readonly CUSTOM_PROMPT_WRAPPER =
    "Here are the merchant's custom instructions that you must follow: <custom_instructions>{{CUSTOM_SYSTEM_PROMPT}}</custom_instructions>";
  private readonly CUSTOM_PROMPT_PLACEHOLDER = "{{ESQUAD_SHOP_CUSTOM_PROMPT}}";

  constructor(shopSettingRespository: ShopSettingRepository) {
    this.shopSettingRespository = shopSettingRespository;
  }

  async getDefaultSystemPrompt(): Promise<string> {
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
    const [shopCustomPrompt, defaultSystemPrompt] = await Promise.all([
      this.getCustomSystemPrompt(shopDomain),
      this.getDefaultSystemPrompt(),
    ]);

    const customPromptSection = shopCustomPrompt
      ? this.generateShopCustomPrompt(shopCustomPrompt)
      : "";

    return defaultSystemPrompt.replace(
      "",
      customPromptSection,
    );
  }

  private generateShopCustomPrompt(shopCustomPrompt: string): string {
    return this.CUSTOM_PROMPT_WRAPPER.replace(
      this.CUSTOM_PROMPT_PLACEHOLDER,
      shopCustomPrompt,
    );
  }

  private async getCustomSystemPrompt(
    shopDomain: string,
  ): Promise<string | null> {
    try {
      const shopSetting =
        await this.shopSettingRespository.findByShopDomain(shopDomain);
      return shopSetting.systemPrompt || null;
    } catch (error) {
      if (error instanceof ShopSettingsNotFound) {
        return null;
      }
      throw error;
    }
  }
}

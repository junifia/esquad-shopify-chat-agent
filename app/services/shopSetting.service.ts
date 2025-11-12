import { ShopSettingRepository } from "app/domain/shop-setting-repository";

export class ShopSettingService {
  private shopSettingRespository: ShopSettingRepository;

  constructor(shopSettingRespository: ShopSettingRepository) {
    this.shopSettingRespository = shopSettingRespository;
  }
}

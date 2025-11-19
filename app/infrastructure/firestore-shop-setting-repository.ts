import type {
  CollectionReference,
  DocumentData,
  QueryDocumentSnapshot,
} from "@google-cloud/firestore";
import { Firestore, FieldValue } from "@google-cloud/firestore";
import type { ShopSettingRepository } from "app/domain/shop-setting-repository";
import type { ShopSetting } from "app/domain/shop-settings";
import { ShopSettingsNotFound } from "app/domain/shop-settings-not-found-exception";

const shopSettingConverter = {
  toFirestore(data: ShopSetting): DocumentData {
    const payload: DocumentData = {
      shopDomain: data.shopDomain,
    };

    if (data.systemPrompt) {
      payload.systemPrompt = data.systemPrompt;
    }

    return payload;
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): ShopSetting {
    const data = snapshot.data();
    return {
      id: snapshot.id,
      shopDomain: data.shopDomain,
      systemPrompt: data.systemPrompt,
    };
  },
};

export class FirestoreShopSettingRepository implements ShopSettingRepository {
  private readonly shopSettingCollectionRef: CollectionReference<ShopSetting>;

  constructor(private readonly firestore: Firestore) {
    this.shopSettingCollectionRef = this.firestore
      .collection("shopsSettings")
      .withConverter(shopSettingConverter);
  }

  async add(shopDomain: string): Promise<ShopSetting> {
    const docRef = this.shopSettingCollectionRef.doc();
    const newShopSetting: ShopSetting = {
      id: docRef.id,
      shopDomain: shopDomain,
    };

    await docRef.set(newShopSetting);

    return newShopSetting;
  }

  async update(shopSetting: ShopSetting): Promise<ShopSetting> {
    const docRef = this.shopSettingCollectionRef.doc(shopSetting.id);

    const payload = {
      shopDomain: shopSetting.shopDomain,
      systemPrompt:
        shopSetting.systemPrompt === ""
          ? FieldValue.delete()
          : shopSetting.systemPrompt,
    };

    await docRef.update(payload);

    const updatedDoc = await docRef.get();
    return updatedDoc.data()!;
  }

  async findByShopDomain(shopDomain: string): Promise<ShopSetting> {
    const snapshot = await this.shopSettingCollectionRef
      .where("shopDomain", "==", shopDomain)
      .get();
    if (snapshot.empty) {
      throw new ShopSettingsNotFound();
    }
    const doc = snapshot.docs[0];
    return doc.data();
  }
}

import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import { authenticate } from "../shopify.server";
import { shopSettingService } from "../config";
import { useEffect, useState } from "react";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const customSystemPrompt = await shopSettingService.getCustomSystemPrompt(
    session.shop,
  );

  return { customSystemPrompt };
}

export default function Index() {
  /** @type {{ customSystemPrompt: import("../domain/shop-settings").ShopSetting.systemPrompt }} */
  const customSystemPrompt = useLoaderData();

  const [initialFormState, setInitialFormState] = useState(customSystemPrompt);
  const [formState, setFormState] = useState(customSystemPrompt);
  const errors = useActionData()?.errors || {};
  const isSaving = useNavigation().state === "submitting";
  const isDirty =
    JSON.stringify(formState) !== JSON.stringify(initialFormState);

  const submit = useSubmit();

  function handleSave() {
    const data = {
      systemPrompt: formState.customSystemPrompt,
    };

    submit(data, { method: "post" });
  }

  useEffect(() => {
    if (isDirty) {
      window.shopify.saveBar.show("setting-form");
    } else {
      window.shopify.saveBar.hide("setting-form");
    }
    return () => {
      window.shopify.saveBar.hide("setting-form");
    };
  }, [isDirty]);

  useEffect(() => {
    setInitialFormState(customSystemPrompt);
    setFormState(customSystemPrompt);
  }, [customSystemPrompt]);

  return (
    <s-page heading="Esquad">
      <ui-title-bar title="eSquad Settings" />
      <s-section>
        <s-heading>Settings</s-heading>
        <form data-save-bar onSubmit={handleSave}>
          <s-text-field
            label="Custom System Prompt"
            error={errors.title}
            autocomplete="off"
            name="systemPrompt"
            value={formState.customSystemPrompt}
            placeholder="Enter a system prompt"
            onInput={(e) =>
              setFormState({ ...formState, title: e.target.value })
            }
          />
          {customSystemPrompt === null ? <NoCustomSystemPrompt /> : null}
        </form>
      </s-section>
    </s-page>
  );
}

const NoCustomSystemPrompt = () => (
  <s-shop>No custom system prompt detected, using eSquad default</s-shop>
);

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  /** @type {any} */
  const data = {
    ...Object.fromEntries(await request.formData()),
    shop,
  };
  console.log(data);
  // await shopSettingService.saveCustomSystemPrompt(
  //   session.shop,
  //   data.customSystemPrompt,
  // );
}

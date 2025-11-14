import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import { authenticate } from "../shopify.server";
import { shopSettingService } from "../config";
import { useEffect, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";

export async function loader({ request }) {
  const { session } = await authenticate.admin(request);
  const customSystemPrompt = await shopSettingService.getCustomSystemPrompt(
    session.shop,
  );

  return {
    customSystemPrompt: customSystemPrompt || "",
  };
}

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const formData = await request.formData();
  const data = Object.fromEntries(formData);
  let shopSetting;
  try {
    shopSetting = await shopSettingService.saveCustomSystemPrompt(
      shop,
      data.customSystemPrompt,
    );
  } catch (error) {
    return { error: error.message };
  }

  return {
    customSystemPrompt: shopSetting.systemPrompt || "",
  };
}

export default function SettingsPage() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const errors = actionData?.errors || {};
  const navigation = useNavigation();
  const submit = useSubmit();

  const [initialFormState, setInitialFormState] = useState(loaderData);
  const [formState, setFormState] = useState(loaderData);

  const isLoading = navigation.state === "submitting";

  const errorBanner = actionData?.error ? (
    <s-banner title="Error" tone="critical">
      An error occured. Details: {actionData.error}
    </s-banner>
  ) : null;

  const sucessBanner =
    actionData?.customSystemPrompt && !isLoading ? (
      <s-banner tone="success">Saved with success</s-banner>
    ) : null;
  const loadingBanner = isLoading ? (
    <s-banner tone="info">Saving in progress</s-banner>
  ) : null;

  const isDirty =
    JSON.stringify(formState) !== JSON.stringify(initialFormState);

  useEffect(() => {
    setInitialFormState(loaderData);
    setFormState(loaderData);
  }, [loaderData]);

  useEffect(() => {
    if (isDirty) {
      window.shopify.saveBar.show("setting-form");
    } else {
      window.shopify.saveBar.hide("setting-form");
    }
  }, [isDirty]);

  function handleSubmit() {
    const data = {
      customSystemPrompt: formState.customSystemPrompt,
    };
    submit(data, { method: "post" });
  }
  function handleDiscard() {
    setFormState(initialFormState);
    window.shopify.saveBar.hide("setting-form");
  }
  return (
    <s-page heading="eSquad settings">
      <s-section>
        <s-heading>Settings</s-heading>
        <SaveBar id="setting-form">
          <button variant="primary" onClick={handleSubmit}></button>
          <button onClick={handleDiscard}></button>
        </SaveBar>
        {sucessBanner}
        {errorBanner}
        {loadingBanner}
        <form>
          <s-box padding="base">
            <s-text-field
              label="Custom System Prompt"
              error={errors.customSystemPrompt}
              autoComplete="off"
              name="customSystemPrompt"
              value={formState.customSystemPrompt}
              placeholder="Enter a system prompt"
              onInput={(e) =>
                setFormState({
                  ...formState,
                  customSystemPrompt: e.target.value,
                })
              }
            />
            <s-divider color="base"></s-divider>
            {loaderData.customSystemPrompt === "" ? (
              <NoCustomSystemPrompt />
            ) : null}
          </s-box>
        </form>
      </s-section>
    </s-page>
  );
}

const NoCustomSystemPrompt = () => (
  <s-chip>No custom system prompt detected, using eSquad default</s-chip>
);

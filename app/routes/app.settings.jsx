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
  console.log("action called");
  const { session, redirect } = await authenticate.admin(request);
  const { shop } = session;

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  console.log("action -> ", data, shop);
  const shopSetting = await shopSettingService.saveCustomSystemPrompt(
    shop,
    data.customSystemPrompt,
  );

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

  // This setup for state management mirrors the sample file.
  const [initialFormState, setInitialFormState] = useState(loaderData);
  const [formState, setFormState] = useState(loaderData);

  const isLoading = navigation.state === "submitting";
  // const errorBanner = actionData?.error ? (
  //   <Banner title="Error" tone="critical"></Banner>
  // ): null;

  const sucessBanner = actionData?.customSystemPrompt ? (
    <s-banner tone="success">Saved with success</s-banner>
  ) : null;

  const isDirty =
    JSON.stringify(formState) !== JSON.stringify(initialFormState);

  // Update the form state when the loader provides new data.
  useEffect(() => {
    setInitialFormState(loaderData);
    setFormState(loaderData);
  }, [loaderData]);

  // Manages the Shopify Save Bar visibility based on form changes.
  useEffect(() => {
    if (isDirty) {
      //window.shopify.saveBar.show("setting-form");
    } else {
      //window.shopify.saveBar.hide("setting-form");
    }
    return () => {
      //window.shopify.saveBar.hide("setting-form");
    };
  }, [isDirty]);

  function handleSubmit() {
    console.log("handleSubmit!!!!!!");
    const data = {
      customSystemPrompt: formState.customSystemPrompt,
    };
    //window.shopify.saveBar.hide("setting-form");
    submit(data, { method: "post" });
  }
  function handleDiscard() {
    setFormState(initialFormState);
    //window.shopify.saveBar.hide("setting-form");
  }
  return (
    <s-page heading="Esquad settings">
      <s-section>
        <s-heading>Settings</s-heading>
        {sucessBanner}
        <form onSubmit={handleSubmit}>
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
          {loaderData.customSystemPrompt === "" ? (
            <NoCustomSystemPrompt />
          ) : null}
          <s-divider />
          {isDirty ? (
            <s-button
              variant="primary"
              submit
              loading={isLoading}
              onClick={handleSubmit}
            >
              Save
            </s-button>
          ) : null}
        </form>
      </s-section>
    </s-page>
  );
}

const NoCustomSystemPrompt = () => (
  <s-chip>No custom system prompt detected, using eSquad default</s-chip>
);

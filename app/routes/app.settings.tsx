import {
  useActionData,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router";
import { authenticate } from "../shopify.server";
import { shopSettingService } from "../config";
import { useEffect, useId, useState } from "react";
import { SaveBar } from "@shopify/app-bridge-react";

// Define an interface for the form state and loader/action data
interface SettingsData {
  customSystemPrompt: string;
}

// Interface for the data being submitted
interface SubmitData {
  [key: string]: string;
}

interface ActionResponse {
  customSystemPrompt?: string;
  error?: string;
}

interface LoaderResponse {
  customSystemPrompt: string;
}

// Extend the Window interface to include the shopify object for TypeScript
declare global {
  interface Window {
    shopify: {
      saveBar: {
        show: (id: string) => void;
        hide: (id: string) => void;
      };
    };
  }
}

export async function loader({
  request,
}: {
  request: Request;
}): Promise<LoaderResponse> {
  const { session } = await authenticate.admin(request);
  const shopSetting = await shopSettingService.getSetting(session.shop);

  return {
    customSystemPrompt: shopSetting?.systemPrompt || "",
  };
}

export async function action({
  request,
}: {
  request: Request;
}): Promise<ActionResponse | Response> {
  const { session } = await authenticate.admin(request);
  const { shop } = session;

  const formData = await request.formData();
  const data = Object.fromEntries(formData);

  if (typeof data.customSystemPrompt !== "string") {
    return { error: "Invalid customSystemPrompt" };
  }

  try {
    const shopSetting = await shopSettingService.saveCustomSystemPrompt(
      shop,
      data.customSystemPrompt,
    );

    return {
      customSystemPrompt: shopSetting.systemPrompt || "",
    };
  } catch (error: unknown) {
    console.error(error);
    return { error: "An error occurred, please try again later." };
  }
}

export default function SettingsPage() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const navigation = useNavigation();
  const submit = useSubmit();
  const saveBarId = useId();

  const [initialFormState, setInitialFormState] =
    useState<SettingsData>(loaderData);
  const [formState, setFormState] = useState<SettingsData>(loaderData);

  const isLoading = navigation.state === "submitting";
  const isDirty =
    JSON.stringify(formState) !== JSON.stringify(initialFormState);

  useEffect(() => {
    setInitialFormState(loaderData);
    setFormState(loaderData);
  }, [loaderData]);

  useEffect(() => {
    if (isDirty) {
      window.shopify.saveBar.show(saveBarId);
    } else {
      window.shopify.saveBar.hide(saveBarId);
    }
  }, [isDirty, saveBarId]);

  function handleSubmit() {
    const data: SubmitData = {
      customSystemPrompt: formState.customSystemPrompt,
    };
    submit(data, { method: "post" });
  }

  function handleDiscard() {
    setFormState(initialFormState);
  }

  const errorBanner = actionData?.error ? (
    <s-banner tone="critical">{actionData.error}</s-banner>
  ) : null;

  const sucessBanner =
    actionData?.customSystemPrompt != null && !isLoading ? (
      <s-banner tone="success">Saved with success</s-banner>
    ) : null;

  const loadingBanner = isLoading ? (
    <s-banner tone="info">Saving in progress</s-banner>
  ) : null;

  return (
    <s-page heading="eSquad settings">
      <s-section>
        <s-heading>Settings</s-heading>
        <SaveBar id={saveBarId}>
          <button
            type="button"
            variant="primary"
            onClick={handleSubmit}
          ></button>
          <button type="button" onClick={handleDiscard}></button>
        </SaveBar>
        {sucessBanner}
        {errorBanner}
        {loadingBanner}
        <form>
          <s-box padding="base">
            <s-text-area
              label="Custom System Prompt"
              autocomplete="off"
              name="customSystemPrompt"
              value={formState.customSystemPrompt}
              placeholder="Enter a system prompt"
              onInput={(e: { currentTarget: { value: string } }) =>
                setFormState({
                  ...formState,
                  customSystemPrompt: e.currentTarget.value,
                })
              }
            />
            <s-chip>
              Set specific instructions to guide how your chatbot interacts with
              customers. Control tone, style, and the type of answers it
              provides.
            </s-chip>
          </s-box>
        </form>
      </s-section>
    </s-page>
  );
}

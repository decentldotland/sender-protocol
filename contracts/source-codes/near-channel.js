export async function handle(state, action) {
  const { meta, molecule, subscribers, notifications } = state;

  const { admin_address, near_registry_address, name, description, url } = meta;

  const { evm_endpoint, near_endpoint, signature_message, signatures } =
    molecule;

  async function push({
    title = "",
    body = "",
    type = "",
    recipients = [],
    caller = "",
    signature = "",
  }) {
    const notification_id = SmartWeave.transaction.id;
    await authenticate_caller(caller, signature);
    ContractAssert(
      caller.toUpperCase() == admin_address.toUpperCase(),
      "caller is not admin"
    );

    ContractAssert(
      ["update", "alert", "warning", "urgent"].includes(type),
      "notification type not supported"
    );
    ContractAssert(
      ["string"].includes(typeof title && typeof body),
      "title or body type not supported"
    );
    ContractAssert(recipients.length, "empty recipients array");
    const subscribers = await getSubscribers();
    if (recipients[0] === "all") {
      recipients = subscribers;
    } else {
      for (const address of recipients) {
        ContractAssert(
          subscribers.includes(address),
          "address is not subscribed to this channnel"
        );
      }
    }

    notifications.push({
      notification_id,
      title,
      body,
      type,
      recipients,
    });
  }

  async function authenticate_caller(address, signature) {
    try {
      ContractAssert(
        !signatures.includes(signature),
        "a used signature is supplied"
      );
      const base64Msg = btoa(signature_message);
      const request = await EXM.deterministicFetch(
        `${endpoint}/signer/${address}/${base64Msg}/${signature}`
      );
      ContractAssert(request.asJSON()?.result, "caller authentication failed");
      signatures.push(signature);
    } catch (err) {
      throw new ContractError("molecule error");
    }
  }

  async function getSubscribers() {
    try {
      const nearRegistryState = await EXM.deterministicFetch(
        `${near_endpoint}/n-view-state/mainnet/${near_registry_address}`
      );
      const nearState = nearRegistryState?.asJSON()?.result;
      const subscribers = nearState.find((k) => k.key.toLowerCase() == "state");

      return JSON.parse(subscribers.value);
    } catch (error) {
      throw new ContractError("error while trying to fetch subscribers");
    }
  }

  const { title, body, type, recipients, caller, signature } = action.input;

  switch (action.input.function) {
    case "push":
      return await push({ title, body, type, recipients, caller, signature });

    default:
      throw new ContractError("unknown contract method is supplied");
  }

  return { state };
}

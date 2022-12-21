export async function handle(state, action) {
   const { meta, molecule, subscribers, notifications } = state;

   const { admin_address, name, description, url } = meta;

   const { endpoint, signature_message, signatures } = molecule;

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
      if (recipients[0] === "all") {
         recipients = state.subscribers;
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

   async function subscribe({ caller = "", signature = "" }) {
      ContractAssert(
         !subscribers.includes(caller),
         `${caller} is subscribed to this channel already`
      );
      await authenticate_caller(caller, signature);
      subscribers.push(caller);
   }

   async function unsubscribe({ caller = "", signature = "" }) {
      ContractAssert(
         subscribers.includes(caller),
         `${caller} is not subscribed to this channel already`
      );
      await authenticate_caller(caller, signature);
      const callerIndex = subscribers.findIndex(
         (address) => address.toUpperCase() === caller.toUpperCase()
      );
      subscribers.splice(callerIndex, 1);
   }

   async function authenticate_caller(address, signature) {
      try {
         ContractAssert(
            !signatures.includes(signature),
            "a used signature is supplied"
         );
         const base64Msg = btoa(signature_message);
         const request = await EXM.deterministicFetch(
            `${endpoint}/stx-auth/${address}/${base64Msg}/${signature}`
         );
         ContractAssert(request.asJSON()?.result, "caller authentication failed");
         signatures.push(signature);
      } catch (err) {
         throw new ContractError("molecule error");
      }
   }

   const { title, body, type, recipients, caller, signature } = action.input;

   switch (action.input.function) {
      case "push":
         return await push({ title, body, type, recipients, caller, signature });

      case "subscribe":
         return await subscribe({ caller, signature });

      case "unsubscribe":
         return await unsubscribe({ caller, signature });
      default:
         throw new ContractError("unknown contract method is supplied");
   }

   return { state };
}

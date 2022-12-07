export async function handle(state, action) {
    const { meta, molecule, subscribers, notifications } = state;

    const { admin_public_key, name, description, url } = meta;

    const { endpoint, signature_message, signatures } = molecule;

    async function push({
        title = "",
        body = "",
        type = "",
        recipients = [],
        public_key = "",
        signature = "",
    }) {
        const notification_id = SmartWeave.transaction.id;
        await authenticate_caller(public_key, signature);
        ContractAssert(admin_public_key == public_key, "caller is not admin");

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
                    /[a-z0-9_-]{43}/i.test(address),
                    "invalid AR addr"
                );
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

    async function subscribe({ public_key = "", signature = "" }) {
        await authenticate_caller(public_key, signature);
        const caller = await public_key_to_address(public_key);

        ContractAssert(
            !subscribers.includes(caller),
            `${caller} is subscribed to this channel already`
        );
        await authenticate_caller(caller, signature);
        subscribers.push(caller);
    }

    async function unsubscribe({ public_key = "", signature = "" }) {
        await authenticate_caller(public_key, signature);
        const caller = await public_key_to_address(public_key);

        ContractAssert(
            subscribers.includes(caller),
            `${caller} is not subscribed to this channel already`
        );
        const callerIndex = subscribers.findIndex(
            (address) => address === caller
        );
        subscribers.splice(callerIndex, 1);
    }

    async function authenticate_caller(public_key, signature) {
        try {
            ContractAssert(
                !signatures.includes(signature),
                "a used signature is supplied"
            );
            const valid = await SmartWeave.arweave.crypto.verify(
                public_key,
                new TextEncoder().encode(signature_message),
                Uint8Array.from(atob(signature), (c) => c.charCodeAt(0))
            );

            ContractAssert(valid, "caller authentication failed");

            signatures.push(signature);
        } catch (error) {
            throw new ContractError("molecule error");
        }
    }

    async function public_key_to_address(public_key) {
        try {
            const request = await EXM.deterministicFetch(
                `${endpoint}/ota/${public_key}`
            );
            const address = request.asJSON()?.address;
            ContractAssert(address.length === 43, "not AR address");
            return address;
        } catch (error) {
            throw new ContractError("molecule error");
        }
    }

    const { title, body, type, recipients, public_key, signature } =
        action.input;

    switch (action.input.function) {
        case "push":
            return await push({
                title,
                body,
                type,
                recipients,
                public_key,
                signature,
            });

        case "subscribe":
            return await subscribe({ public_key, signature });

        case "unsubscribe":
            return await unsubscribe({ public_key, signature });
        default:
            throw new ContractError("unknown contract method is supplied");
    }

    return { state };
}

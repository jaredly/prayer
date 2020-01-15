// @flow

const ponce = v =>
    new Promise((res, rej) =>
        v.once(ack => (!ack || ack.err ? rej(ack) : res(ack))),
    );

export const login = async (
    gun: *,
    user: *,
    username: string,
    password: string,
) => {
    console.log('logging in');
    const exists = await ponce(gun.get(`~@${username}`)).catch(err => false);
    if (!exists) {
        console.log('creating');
        await new Promise((res, rej) =>
            user.create(username, password, ack =>
                ack.err ? rej(new Error(ack.err)) : res(ack),
            ),
        );
        console.log('created');
    }
    await new Promise((res, rej) =>
        user.auth(username, password, ack =>
            ack.err ? rej(new Error(ack.err)) : res(ack),
        ),
    );
    user.recall({ sessionStorage: true });
    console.log('logged in');
    return;
};

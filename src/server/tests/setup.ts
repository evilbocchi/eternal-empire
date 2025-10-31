// declare module "@rbxts/jest-globals" {
//     namespace jest {
//         interface Matchers<R, T = {}> {
//             /**
//              * Custom matcher to check if an OnoeNum equals the expected value.
//              * @param expected The expected value (can be a number or OnoeNum)
//              */
//             toEqualOnoeNum(expected: number | OnoeNum): R;
//         }
//     }
// }

// Clear registered modules to reset the roblox-ts runtime
for (const [key] of pairs(_G)) {
    if (typeIs(key, "Instance") && key.IsA("ModuleScript")) {
        _G[key as never] = undefined as never;
    }
}

// expect.extend({
//     toEqualOnoeNum(received: OnoeNum | undefined, expected: number | OnoeNum) {
//         const expectedNum = typeIs(expected, "number") ? new OnoeNum(expected) : expected;

//         if (received === undefined) {
//             return {
//                 pass: false,
//                 message: () => `expected OnoeNum but received undefined`,
//             };
//         }

//         if (!typeIs(received, "table") || !("equals" in received)) {
//             return {
//                 pass: false,
//                 message: () => `expected OnoeNum but received ${typeOf(received)}`,
//             };
//         }

//         const pass = received.equals(expectedNum);

//         if (pass) {
//             return {
//                 pass: true,
//                 message: () => `expected ${received.toString()} not to equal ${expectedNum.toString()}`,
//             };
//         } else {
//             return {
//                 pass: false,
//                 message: () => `expected ${received.toString()} to equal ${expectedNum.toString()}`,
//             };
//         }
//     },
// });

import { Controller, OnStart } from "@flamework/core";

export function Hamster() {}

@Controller()
export default class AppController implements OnStart {
    onStart() {}
}

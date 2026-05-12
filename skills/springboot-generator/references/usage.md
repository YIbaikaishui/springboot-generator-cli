# SpringBoot Generator Usage

## Install the skill

```bash
npx skills add https://github.com/YIbaikaishui/springboot-generator-cli --skill springboot-generator
```

## Prefer the published CLI

Use the published CLI by default when the user just wants to generate code:

```bash
npx springboot-generator-cli@latest --help
npx springboot-generator-cli@latest new demo-app
npx springboot-generator-cli@latest g module User
```

Use custom business fields when the module has a concrete domain shape:

```bash
npx springboot-generator-cli@latest g module Product --fields "name:string,price:decimal,active:boolean"
```

## Local repo fallback

When working inside this repository and the built CLI is already available, use the local fallback:

```bash
node dist/cli.js --help
node dist/cli.js new demo-app
node dist/cli.js g module Product --fields "name:string,price:decimal,active:boolean"
```

Use local fallback only when:

- the current workspace is this generator repo
- `dist/cli.js` exists
- the task is testing or iterating on the local generator implementation

## Style selection

Prefer `ddd-modulith`:

```bash
npx springboot-generator-cli@latest g module Order
```

Use compatibility mode only when the user explicitly wants legacy layered output:

```bash
npx springboot-generator-cli@latest g module Order --style layered
```

## Verification

After generation, prefer a compile check when practical:

For Maven:

```bash
mvn -q -DskipTests compile
```

For Gradle:

```bash
gradle compileJava
```

If the user generated a full project through the CLI and the workspace supports Java 21, compile before claiming the scaffold is good.

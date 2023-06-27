dev:
	cd svelte && npm run build
	cp -r ./svelte/dist/* ./axum/static
	cd axum && TODO_SECRET_KEY=test TODO_DOMAIN=localhost TODO_NETWORK=localhost cargo run

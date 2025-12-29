fmt:
	cd svelte && npm run fmt
	cd axum && cargo fmt

dev:
	cd svelte && npm run build
	cp -r ./svelte/dist/* ./axum/static
	cd ldap && sudo docker-compose up -d
	cd axum && LTD_SECRET_KEY=test LTD_DOMAIN=localhost LTD_NETWORK=ldap://localhost:3890 RUST_LOG=debug cargo run

build:
	cd svelte && npm install --package-lock-only
	cd axum && cargo generate-lockfile
	sudo docker build --tag=kyoheiudev/ltd:$(VER) .

push:
	sudo docker push kyoheiudev/ltd:$(VER)

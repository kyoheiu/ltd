fmt:
	cd svelte && npm run fmt
	cd axum && cargo fmt

dev:
	@echo "🛠️  Starting LDAP infrastructure..."
	@(cd ldap && sudo docker-compose up -d)
	@echo "✅ LDAP started."
	@echo "🚀 Starting Axum (Backend) and Svelte (Frontend)..."
	@trap 'kill 0' EXIT; \
	(cd svelte && npm run dev) & \
	(cd axum && LTD_SECRET_KEY=test LTD_DOMAIN=localhost LTD_NETWORK=ldap://localhost:3890 RUST_LOG=debug cargo run) & \
	wait

build:
	cd svelte && npm install --package-lock-only
	cd axum && cargo generate-lockfile
	sudo docker build --tag=kyoheiudev/ltd:$(VER) .

push:
	sudo docker push kyoheiudev/ltd:$(VER)

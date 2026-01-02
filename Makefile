generate:
	buf generate

fmt:
	cd svelte && npm run fmt
	cd client && npx biome check --write .
	cd server && cargo fmt

dev:
	@echo "Starting LDAP." 
	@(cd ldap && sudo docker-compose up -d)
	@echo "LDAP started."
	@echo "Starting Axum (Backend) and React (Frontend)."
	@trap 'kill 0' EXIT; \
	(cd client && npm run dev) & \
	(cd server && LTD_SECRET_KEY=test LTD_DOMAIN=localhost LTD_NETWORK=ldap://localhost:3890 RUST_LOG=debug cargo run) & \
	wait

build:
	cd svelte && npm install --package-lock-only
	cd server && cargo generate-lockfile
	sudo docker build --tag=kyoheiudev/ltd:$(VER) .

push:
	sudo docker push kyoheiudev/ltd:$(VER)

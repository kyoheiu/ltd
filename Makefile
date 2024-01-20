dev:
	cd client && npm i && npm run build && rm -rf ../server/static && mkdir ../server/static && cp -r ./dist/* ../server/static
	cd server && LTD_SECRET_KEY=test LTD_DOMAIN=localhost LTD_NETWORK=ldap://localhost:3890 RUST_LOG=debug cargo run

build:
	cd client && npm install --package-lock-only
	cd server && cargo generate-lockfile
	sudo docker build --tag=kyoheiudev/ltd:$(VER) .

push:
	sudo docker push kyoheiudev/ltd:$(VER)

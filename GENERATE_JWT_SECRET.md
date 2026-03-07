# Generate JWT Secret

## For Windows (PowerShell)

Run this command in PowerShell:

```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## For Mac/Linux

Run this command in Terminal:

```bash
openssl rand -base64 32
```

## Online Alternative

If the above don't work, visit: https://generate-secret.vercel.app/32

## What to Do

1. Run one of the commands above
2. Copy the generated string
3. Add it to your `.env` file as:
   ```
   JWT_SECRET=your_generated_string_here
   ```

## Example

Your `.env` should look like:
```env
JWT_SECRET=Kj8mN2pQ5rT9wX3zA6bC8dE1fG4hI7jK0lM3nO6pQ9rS2tU5vW8xY1zA4bC7dE0f
```

## Important

- Keep this secret safe
- Never commit it to Git
- Use a different secret for production
- Make it at least 32 characters long

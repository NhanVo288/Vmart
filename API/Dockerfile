FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY API/RestoreAPI.Domain/RestoreAPI.Domain.csproj API/RestoreAPI.Domain/
COPY API/RestoreAPI.Application/RestoreAPI.Application.csproj API/RestoreAPI.Application/
COPY API/RestoreAPI.Infrastructure/RestoreAPI.Infrastructure.csproj API/RestoreAPI.Infrastructure/
COPY API/RestoreAPI.Presentation/RestoreAPI.csproj API/RestoreAPI.Presentation/
COPY API/Directory.Build.props API/
RUN dotnet restore API/RestoreAPI.Presentation/RestoreAPI.csproj

COPY API/ API/
RUN dotnet publish API/RestoreAPI.Presentation/RestoreAPI.csproj \
    --configuration Release \
    --output /app/publish \
    --no-restore \
    /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080
ENTRYPOINT ["dotnet", "RestoreAPI.dll"]

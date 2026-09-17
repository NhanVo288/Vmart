using Hangfire.Dashboard;

namespace RestoreAPI.Presentation.Hangfire;

public class HangfireDashboardFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        return context.GetHttpContext().User.IsInRole("Admin");
    }
}

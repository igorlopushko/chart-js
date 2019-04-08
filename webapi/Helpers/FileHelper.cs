using System;
using System.IO;

namespace chart_js_dataprovider.Helpers
{
    public class FileHelper
    {
        public static string GetOverviewJson(int chartId)
        {
            try
            {
                FileStream fileStream = new FileStream(string.Format("Data/{0}/overview.json", chartId), FileMode.Open);
                using (StreamReader reader = new StreamReader(fileStream))
                {
                    return reader.ReadToEnd();
                }
            }
            catch (Exception)
            {
                return "Not Found";
            }
        }

        public static string GetDateJson(int chartId, DateTime date)
        {
            try
            {
                var fileName = string.Format("Data/{0}/{1}-{2}/{3}.json",
                        chartId, 
                        date.Year,
                        date.Month < 10 ? string.Format("0{0}", date.Month) : date.Month.ToString(), 
                        date.Day < 10 ? string.Format("0{0}", date.Day) : date.Day.ToString());
                FileStream fileStream =
                new FileStream(fileName, FileMode.Open);
                using (StreamReader reader = new StreamReader(fileStream))
                {
                    return reader.ReadToEnd();
                }
            }
            catch (Exception)
            {
                return "Not Found";
            }
        }
    }
}

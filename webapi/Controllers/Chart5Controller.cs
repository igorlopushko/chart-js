﻿using System;
using Microsoft.AspNetCore.Mvc;

namespace chart_js_dataprovider.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class Chart5Controller : ControllerBase
    {
        // GET api/chart5
        [HttpGet]
        public ActionResult<string> Get()
        {
            return Helpers.FileHelper.GetOverviewJson(5);
        }

        // GET api/chart5/1522800000000
        [HttpGet("{unixTimestamp}")]
        public ActionResult<string> Get(double unixTimestamp)
        {
            DateTime date = new DateTime(1970, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc);
            date = date.AddMilliseconds(unixTimestamp);

            return Helpers.FileHelper.GetDateJson(5, date);
        }
    }
}